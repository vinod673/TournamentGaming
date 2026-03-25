const express = require('express');
const { Cashfree, CFEnvironment } = require('cashfree-pg');
const crypto = require('crypto');
const router = express.Router();
const { adminClient: supabase } = require('../config/database');

// Cashfree Configuration - PRODUCTION MODE
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'production';

// Initialize Cashfree PG SDK for PRODUCTION
// ✅ Using production mode for live payments
const cashfree = new Cashfree(
  CASHFREE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY
);

console.log(`✅ Cashfree PG SDK initialized in ${CASHFREE_ENV.toUpperCase()} mode`);

/**
 * Create Payment Order using Cashfree PG SDK
 * POST /api/payment/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, userId, userEmail, userName, tournamentId } = req.body;

    // Validation
    if (!amount || amount < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount. Minimum deposit is $1' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Generate unique order ID
    const orderId = `order_${userId}_${Date.now()}`;

    // Prepare request for Cashfree PG SDK
    const request = {
      order_amount: amount,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: userId,
        customer_phone: req.body.customerPhone || '9999999999',
        customer_name: userName || 'Customer',
        customer_email: userEmail || 'customer@example.com'
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/wallet?orderId={order_id}`,
        user_id: userId,
        tournament_id: tournamentId || ''
        // Note: payment_methods removed - Cashfree will show all available methods
      },
      order_tags: {
        platform: 'ArenaX Gaming',
        type: tournamentId ? 'tournament_entry' : 'wallet_topup'
      }
    };

    console.log('📝 Creating order:', orderId);

    // Create order using Cashfree PG SDK
    const response = await cashfree.PGCreateOrder(request);

    console.log('💡 Raw Cashfree Response:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.order_id) {
      console.log('✅ Order created successfully:', orderId);
      
      // Handle different Cashfree response formats
      const payUrl = response.data.pay_url || response.data.payment_url;
      const paymentSessionId = response.data.payment_session_id;
      
      console.log('📍 Payment URL:', payUrl || 'Not provided');
      console.log('📍 Payment Session ID:', paymentSessionId || 'Not provided');
      
      // For production, prefer payUrl over session for better compatibility
      const preferredMethod = payUrl ? 'Redirect URL' : (paymentSessionId ? 'Session (fallback)' : 'None');
      console.log(`🎯 Using ${preferredMethod} for checkout`);
      
      // Save order to database for later verification
      await supabase
        .from('payment_orders')
        .insert([{
          order_id: response.data.order_id,
          user_id: userId,
          amount: amount,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      console.log('💾 Order saved to database:', orderId);
      
      res.json({
        success: true,
        message: 'Payment order created successfully',
        orderId: response.data.order_id,
        payUrl: payUrl,
        paymentSessionId: paymentSessionId,
        orderAmount: response.data.order_amount,
        orderCurrency: response.data.order_currency,
        orderStatus: response.data.order_status,
        checkoutMethod: payUrl ? 'redirect' : (paymentSessionId ? 'modal' : 'none')
      });
    } else {
      throw new Error('Invalid response from Cashfree');
    }

  } catch (error) {
    console.error('❌ Error creating payment order:', error.response?.data || error.message);
    
    // Handle specific Cashfree errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.message || 'Payment gateway error',
        errorCode: error.response.data?.code || 'PAYMENT_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

/**
 * Verify Payment Status using Cashfree PG SDK
 * GET /api/payment/verify/:orderId
 */
router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    console.log('🔍 Verifying order:', orderId);

    // Fetch order status using Cashfree PG SDK
    const response = await cashfree.PGFetchOrder(orderId);

    if (response.data) {
      const orderStatus = response.data.order_status || response.data.status;
      
      console.log('✅ Order verified:', orderId, '- Status:', orderStatus);
      
      res.json({
        success: true,
        message: 'Payment verification successful',
        orderId: orderId,
        status: orderStatus,
        orderAmount: response.data.order_amount,
        orderCurrency: response.data.order_currency,
        customerDetails: response.data.customer_details,
        payments: response.data.payments || [],
        orderTags: response.data.order_tags
      });
    } else {
      throw new Error('Order not found');
    }

  } catch (error) {
    console.error('❌ Error verifying payment:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        orderId: req.params.orderId
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * Manual Payment Verification and Wallet Crediting
 * POST /api/payment/manual-verify
 * 
 * Used when webhook fails or user returns from payment gateway
 * Verifies payment and credits wallet immediately
 */
router.post('/manual-verify', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      console.error('❌ Order ID missing from request');
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    console.log('🔍 Manual verification requested for order:', orderId);
    console.log('💾 Looking up order in database...');

    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Database connection unavailable'
      });
    }

    // Step 1: Fetch order status from Cashfree
    const cashfreeResponse = await cashfree.PGFetchOrder(orderId);
    
    if (!cashfreeResponse.data) {
      return res.status(404).json({
        success: false,
        message: 'Order not found in Cashfree'
      });
    }

    const orderStatus = cashfreeResponse.data.order_status || cashfreeResponse.data.status;
    const orderAmount = cashfreeResponse.data.order_amount;
    const userId = cashfreeResponse.data.order_meta?.user_id;

    console.log('💡 Order status:', orderStatus, '| Amount:', orderAmount, '| User ID:', userId);

    if (!userId) {
      // Try to find from local database
      const { data: localOrder } = await supabase
        .from('payment_orders')
        .select('user_id')
        .eq('order_id', orderId)
        .single();
      
      if (localOrder) {
        userId = localOrder.user_id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'User ID not found for this order'
        });
      }
    }

    // Step 2: Check if already processed
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('metadata->>order_id', orderId)
      .eq('status', 'completed')
      .single();

    if (existingTransaction) {
      console.log('✅ Payment already processed');
      return res.json({
        success: true,
        alreadyProcessed: true,
        message: 'Payment already credited to wallet',
        amount: existingTransaction.amount,
        orderId
      });
    }

    // Step 3: Verify payment was successful
    // Accept multiple success statuses for better reliability
    const validStatuses = ['PAID', 'SUCCESS', 'COMPLETED', 'ORDER_SUCCESS'];
    
    if (!validStatuses.includes(orderStatus)) {
      console.log('⏳ Payment still processing. Current status:', orderStatus);
      
      // If pending, wait a bit and retry (for cases where webhook hasn't updated yet)
      if (orderStatus === 'PENDING' || orderStatus === 'AUTHORIZED') {
        console.log('⏳ Waiting 2 seconds for status update...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Retry fetch
        const retryResponse = await cashfree.PGFetchOrder(orderId);
        const retryStatus = retryResponse.data?.order_status || retryResponse.data?.status;
        
        if (validStatuses.includes(retryStatus)) {
          console.log('✅ Status updated to:', retryStatus);
          // Continue with wallet crediting
        } else {
          return res.status(400).json({
            success: false,
            message: `Payment still processing. Status: ${retryStatus}. Please wait a moment and refresh.`,
            orderId,
            status: retryStatus,
            retryable: true
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Payment not completed. Status: ${orderStatus}. Please contact support if money was deducted.`,
          orderId,
          status: orderStatus
        });
      }
    }

    // Step 4: Credit wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    let newBalance;
    if (wallet) {
      newBalance = (wallet.balance || 0) + orderAmount;
      await supabase
        .from('wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create wallet if doesn't exist
      newBalance = orderAmount;
      await supabase
        .from('wallets')
        .insert([{
          user_id: userId,
          balance: orderAmount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
    }

    // Step 5: Update transaction record
    const { data: pendingTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('metadata->>order_id', orderId)
      .eq('status', 'pending')
      .single();

    if (pendingTx) {
      await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          metadata: {
            ...pendingTx.metadata,
            verified_at: new Date().toISOString(),
            cashfree_order_id: orderId,
            payment_status: orderStatus
          }
        })
        .eq('id', pendingTx.id);
    } else {
      // Create new transaction record
      await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          type: 'deposit',
          amount: orderAmount,
          status: 'completed',
          description: 'Deposit via Cashfree',
          metadata: {
            cashfree_order_id: orderId,
            payment_status: orderStatus,
            verified_at: new Date().toISOString(),
            timestamp: new Date().toISOString()
          }
        }]);
    }

    // Step 6: Update payment_orders table
    await supabase
      .from('payment_orders')
      .upsert({
        order_id: orderId,
        user_id: userId,
        amount: orderAmount,
        status: 'paid',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'order_id'
      });

    console.log('✅ Wallet credited successfully! New balance:', newBalance);

    res.json({
      success: true,
      alreadyProcessed: false,
      message: 'Wallet credited successfully',
      amount: orderAmount,
      newBalance: newBalance,
      orderId,
      status: orderStatus
    });

  } catch (error) {
    console.error('❌ Manual verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message || error.toString()
    });
  }
});

/**
 * Webhook Handler
 * POST /api/payment/webhook
 * 
 * Handles Cashfree payment webhooks for automatic status updates
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    // Verify webhook signature (REQUIRED for security)
    const signature = req.headers['x-webhook-signature'];
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    
    if (signature && webhookSecret) {
      // Verify webhook signature using HMAC SHA256
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature! Potential security breach.');
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
      console.log('✅ Webhook signature verified');
    } else if (!webhookSecret) {
      console.warn('⚠️ CASHFREE_WEBHOOK_SECRET not set. Skipping signature verification.');
    }

    const { event, data } = req.body;

    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      return res.status(500).json({
        success: false,
        message: 'Database connection unavailable'
      });
    }

    // Handle different webhook events
    switch (event) {
      case 'ORDER_PAID':
        console.log('✅ Payment completed for order:', data.order_id);
        
        // Find the order in database
        const { data: orderData } = await supabase
          .from('payment_orders')
          .select('*')
          .eq('order_id', data.order_id)
          .single();

        if (orderData) {
          // Update order status
          await supabase
            .from('payment_orders')
            .update({ 
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderData.id);

          // Update user's wallet balance
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', orderData.user_id)
            .single();

          if (wallet) {
            const newBalance = (wallet.balance || 0) + orderData.amount;
            await supabase
              .from('wallets')
              .update({ 
                balance: newBalance,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', orderData.user_id);
            
            console.log(`✅ Wallet credited! User: ${orderData.user_id}, Amount: ₹${orderData.amount}, New Balance: ₹${newBalance}`);
          } else {
            // Create wallet if doesn't exist
            await supabase
              .from('wallets')
              .insert([{
                user_id: orderData.user_id,
                balance: orderData.amount,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
            
            console.log(`✅ Wallet created and credited! User: ${orderData.user_id}, Amount: ₹${orderData.amount}`);
          }

          // Update transaction record
          const { data: existingTx } = await supabase
            .from('transactions')
            .select('metadata')
            .eq('user_id', orderData.user_id)
            .eq('metadata->>order_id', data.order_id)
            .single();

          await supabase
            .from('transactions')
            .update({ 
              status: 'completed',
              metadata: {
                ...(existingTx?.metadata || {}),
                verified_at: new Date().toISOString(),
                cashfree_order_id: data.order_id,
                webhook_verified: true
              }
            })
            .eq('metadata->>order_id', data.order_id);

          console.log('✅ Transaction marked as completed');
        } else {
          console.warn('⚠️ Order not found in database, will be handled by manual verification on redirect');
        }
        break;

      case 'ORDER_PENDING':
        console.log('⏳ Payment pending for order:', data.order_id);
        // Update order status to pending
        await supabase
          .from('payment_orders')
          .update({ 
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('cashfree_order_id', data.order_id);
        break;

      case 'ORDER_CANCELLED':
        console.log('❌ Order cancelled:', data.order_id);
        // Update order status to cancelled
        await supabase
          .from('payment_orders')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('cashfree_order_id', data.order_id);
        
        // Mark transaction as failed
        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            metadata: {
              cancelled_at: new Date().toISOString()
            }
          })
          .eq('metadata->>order_id', data.order_id);
        break;

      case 'PAYMENT_FAILED':
        console.log('💥 Payment failed for order:', data.order_id);
        // Update payment status
        await supabase
          .from('payment_orders')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('cashfree_order_id', data.order_id);
        
        // Mark transaction as failed
        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            metadata: {
              failed_at: new Date().toISOString(),
              failure_reason: data.failure_reason || 'Unknown error'
            }
          })
          .eq('metadata->>order_id', data.order_id);
        break;

      default:
        console.log('📝 Unhandled webhook event:', event);
    }

    // Acknowledge webhook receipt
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      status: 'processed'
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Still return 200 to prevent Cashfree from retrying
    // Log the error for manual investigation
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed but acknowledged',
      error: error.message
    });
  }
});

module.exports = router;
