<?php
// Prevent direct access to this file
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// --- CONFIGURATION ---
// TODO: Replace with your actual ReCAPTCHA Secret Key
$recaptcha_secret = "6LdfMSEsAAAAAOPQAzU7L6DmosWN_rJH2yJtXEdY"; 
$recipient_email = "youness@sambasurfshop.com";
$from_email = "youness@sambasurfshop.com"; // Change this to a domain you own if possible
$company_name = "Samba Surf Shop";

// --- RECAPTCHA VERIFICATION ---
$recaptcha_response = $_POST['g-recaptcha-response'] ?? '';

if (empty($recaptcha_response)) {
    echo json_encode(['success' => false, 'message' => 'Please complete the CAPTCHA.']);
    exit;
}

$verify_url = 'https://www.google.com/recaptcha/api/siteverify';
$verify_data = [
    'secret' => $recaptcha_secret,
    'response' => $recaptcha_response,
    'remoteip' => $_SERVER['REMOTE_ADDR']
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($verify_data)
    ]
];

$context  = stream_context_create($options);
$verify_result = file_get_contents($verify_url, false, $context);
$verify_json = json_decode($verify_result);

if (!$verify_json->success) {
    echo json_encode(['success' => false, 'message' => 'reCAPTCHA verification failed. Please try again.']);
    exit;
}

// --- DATA PROCESSING ---
$form_type = $_POST['form_type'] ?? 'general';
$subject = "";
$body_content = "";

// Function to sanitize input
function clean_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

// Common fields
$full_name = clean_input($_POST['fullName'] ?? 'Unknown');
$email = clean_input($_POST['email'] ?? 'Unknown');

// Build Email Content based on Type
if ($form_type === 'booking') {
    $subject = "New Booking Request: $full_name";
    
    $phone = clean_input($_POST['phone'] ?? '');
    $service = clean_input($_POST['service'] ?? '');
    $level = clean_input($_POST['level'] ?? 'Not Specified');
    $date = clean_input($_POST['date'] ?? '');
    $time = clean_input($_POST['time'] ?? '');
    $people = clean_input($_POST['people'] ?? '');
    $sessions = clean_input($_POST['sessions'] ?? '');
    $estimated_total = clean_input($_POST['estimated_total'] ?? '0');
    
    $extras = [];
    if (isset($_POST['extra-food'])) $extras[] = "Food & Drink";
    if (isset($_POST['extra-photo'])) $extras[] = "Photo Package";
    $extras_str = !empty($extras) ? implode(", ", $extras) : "None";

    $body_content = "
        <h2 style='color: #bf5300; font-family: sans-serif;'>New Booking Request</h2>
        <p><strong>Customer:</strong> $full_name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Phone:</strong> $phone</p>
        <hr style='border: 1px solid #eee;'>
        <h3 style='color: #333; font-family: sans-serif;'>Booking Details</h3>
        <table style='width: 100%; border-collapse: collapse; font-family: sans-serif;'>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Service:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>$service</td></tr>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Surf Level:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee; color: #bf5300; font-weight: bold;'>$level</td></tr>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Date:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>$date</td></tr>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Time:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>$time</td></tr>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>People:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>$people</td></tr>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Sessions:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>$sessions</td></tr>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Extras:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>$extras_str</td></tr>
            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Est. Total:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee; font-size: 1.2em; font-weight: bold;'>$estimated_total MAD</td></tr>
        </table>
    ";

} else {
    // General Inquiry
    $subject = "General Inquiry: " . clean_input($_POST['subject'] ?? 'No Subject');
    $message = nl2br(clean_input($_POST['message'] ?? ''));
    
    $body_content = "
        <h2 style='color: #bf5300; font-family: sans-serif;'>New Message Received</h2>
        <p><strong>From:</strong> $full_name ($email)</p>
        <hr style='border: 1px solid #eee;'>
        <p style='font-family: sans-serif; font-size: 16px; line-height: 1.5; color: #333;'>$message</p>
    ";
}

// --- EMAIL CONSTRUCTION ---
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: $company_name <$from_email>" . "\r\n";
$headers .= "Reply-To: $email" . "\r\n";

$email_template = "
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }
</style>
</head>
<body>
    <div class='container'>
        <div style='text-align: center; margin-bottom: 20px;'>
             <h1 style='color: #bf5300; margin: 0;'>$company_name</h1>
        </div>
        $body_content
        <div class='footer'>
            <p>This email was sent from your website contact form.</p>
        </div>
    </div>
</body>
</html>
";

// --- SENDING ---
if (mail($recipient_email, $subject, $email_template, $headers)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server failed to send email.']);
}
?>