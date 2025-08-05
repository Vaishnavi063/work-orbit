package com.workorbit.backend.Wallet.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.workorbit.backend.Auth.Service.EmailService;
import com.workorbit.backend.Entity.Client;
import com.workorbit.backend.Repository.ClientRepository;
import com.workorbit.backend.Wallet.DTO.AddMoneyOrderRequest;
import com.workorbit.backend.Wallet.DTO.RazorpayOrderResponse;
import com.workorbit.backend.Wallet.DTO.VerifyPaymentRequest;
import com.workorbit.backend.Wallet.DTO.WalletResponseDTO;
import com.workorbit.backend.Wallet.Repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayService {

    @Value("${razorpay.api.key}")
    private String razorpayKey;

    @Value("${razorpay.api.secret}")
    private String razorpaySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.company.name:WorkOrbit}")
    private String companyName;

    private final WalletService walletService;
    private final WalletTransactionRepository transactionRepository;
    private final EmailService emailService;
    private final ClientRepository clientRepository;

    public RazorpayOrderResponse createWalletTopupOrder(AddMoneyOrderRequest request) throws RazorpayException {
        log.info("Creating Razorpay order for userId: {}, amount: {}", request.getUserId(), request.getAmount());

        try {
            // Initialize Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKey, razorpaySecret);

            // Create order options
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount() * 100); // Convert to paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", generateReceiptId(request.getUserId()));

            // Add notes for tracking
            JSONObject notes = new JSONObject();
            notes.put("userId", request.getUserId());
            notes.put("userRole", request.getRole());
            notes.put("purpose", "wallet_topup");
            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);

            log.info("✅ Razorpay order created successfully: {}", (String) order.get("id"));

            return RazorpayOrderResponse.builder()
                    .orderId(order.get("id"))
                    .razorpayKey(razorpayKey)
                    .amount(request.getAmount())
                    .currency(currency)
                    .companyName(companyName)
                    .description("Add money to " + companyName + " wallet")
                    .userId(request.getUserId())
                    .build();

        } catch (RazorpayException e) {
            log.error("❌ Failed to create Razorpay order for userId: {}", request.getUserId(), e);
            throw new RazorpayException("Failed to create payment order: " + e.getMessage());
        }
    }

    @Transactional
    public WalletResponseDTO verifyAndAddToWallet(VerifyPaymentRequest request) {
        log.info("Verifying payment for userId: {}, paymentId: {}", request.getUserId(), request.getRazorpayPaymentId());

        try {
            // 1. Verify payment signature
            if (!verifyPaymentSignature(request)) {
                throw new RuntimeException("Invalid payment signature. Payment verification failed.");
            }

            // 2. Check for duplicate payment processing
            if (isPaymentAlreadyProcessed(request.getRazorpayPaymentId())) {
                throw new RuntimeException("Payment already processed. Duplicate payment detected.");
            }

            // 3. Add money to wallet using existing service
            WalletResponseDTO walletResponse = walletService.addMoneyAfterVerification(
                    request.getUserId(),
                    request.getRole(),
                    request.getAmount(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpayOrderId()
            );

            Client client = clientRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("Client not found with ID: " + request.getUserId()));

            String email = client.getAppUser().getEmail();
            String fullName = client.getName(); // or getName()

            // 5. ✅ Trigger payment confirmation email
            emailService.sendPaymentConfirmationEmail(
                    email,
                    fullName,
                    request.getAmount(),
                    request.getRazorpayPaymentId(),
                    "Razorpay"
            );

            log.info("✅ Payment verified and money added successfully for userId: {}", request.getUserId());
            return walletResponse;

        } catch (Exception e) {
            log.error("❌ Payment verification failed for userId: {}", request.getUserId(), e);
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    /**
     * Verify Razorpay payment signature
     */
    private boolean verifyPaymentSignature(VerifyPaymentRequest request) {
        try {
            // Create attributes for signature verification
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());

            // Verify signature using Razorpay utility
            Utils.verifyPaymentSignature(attributes, razorpaySecret);

            log.info("✅ Payment signature verified successfully");
            return true;

        } catch (RazorpayException e) {
            log.error("❌ Payment signature verification failed", e);
            return false;
        }
    }

    /**
     * Check if payment is already processed
     */
    private boolean isPaymentAlreadyProcessed(String razorpayPaymentId) {
        return transactionRepository.existsByRazorpayPaymentId(razorpayPaymentId);
    }

    /**
     * Generate unique receipt ID
     */
    private String generateReceiptId(Long userId) {
        return "wallet_topup_" + userId + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}