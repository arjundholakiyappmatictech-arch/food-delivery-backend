{{-- resources/views/emails/verify-email.blade.php --}}
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify Your Email</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f5f7; font-family: 'Segoe UI', Arial, sans-serif;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
        <tr>
            <td align="center">

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#4f46e5; padding:32px 40px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600;">
                                {{ config('app.name') }}
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px; color:#111827; font-size:22px;">
                                Hello {{ $user->full_name ?? $user->name }} 👋
                            </h2>

                            <p style="margin:0 0 16px; color:#4b5563; font-size:15px; line-height:1.6;">
                                Thanks for joining <strong>{{ config('app.name') }}</strong>. Please confirm this is your email address to activate your account.
                            </p>

                            <p style="margin:0 0 32px; color:#4b5563; font-size:15px; line-height:1.6;">
                                Click the button below to verify your email:
                            </p>

                            <!-- Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-radius:6px; background-color:#4f46e5;">
                                        <a href="{{ $url }}"
                                            style="display:inline-block; padding:12px 28px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:6px;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:32px 0 8px; color:#6b7280; font-size:13px; line-height:1.6;">
                                ⏱️ This link will expire in <strong>60 minutes</strong>.
                            </p>

                            <p style="margin:0 0 24px; color:#9ca3af; font-size:13px; line-height:1.6;">
                                If the button above doesn't work, copy and paste this link into your browser:
                                <br>
                                <a href="{{ $url }}" style="color:#4f46e5; word-break:break-all;">{{ $url }}</a>
                            </p>

                            <p style="margin:0; color:#9ca3af; font-size:13px; line-height:1.6;">
                                If you didn't create an account, no further action is required.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f9fafb; padding:24px 40px; text-align:center; border-top:1px solid #e5e7eb;">
                            <p style="margin:0; color:#9ca3af; font-size:12px;">
                                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>