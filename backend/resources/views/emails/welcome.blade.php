<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;">

                    <!-- Header -->
                    <tr>
                        <td align="center"
                            style="background:#4F46E5;color:#ffffff;padding:30px;font-size:28px;font-weight:bold;">
                            Welcome to {{ config('app.name') }}
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:40px;color:#333333;line-height:1.8;">

                            <h2 style="margin-top:0;">
                                Hello, {{ $user->full_name ?? $user->name }} 👋
                            </h2>

                            <p>
                                Thank you for registering with
                                <strong>{{ config('app.name') }}</strong>.
                            </p>

                            <p>
                                Your account has been created successfully. You can now explore all
                                the features available on our platform.
                            </p>

                            <table cellpadding="0" cellspacing="0" style="margin:30px 0;">
                                <tr>
                                    <td align="center"
                                        style="background:#4F46E5;border-radius:6px;">
                                        <a href="{{ config('app.url') }}"
                                            style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:bold;">
                                            Visit Website
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <hr style="border:none;border-top:1px solid #eeeeee;">

                            <p>
                                <strong>Your Registered Email:</strong><br>
                                {{ $user->email }}
                            </p>

                            <p>
                                If you have any questions, simply reply to this email.
                                We're always happy to help.
                            </p>

                            <p>
                                Regards,<br>
                                <strong>{{ config('app.name') }} Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center"
                            style="padding:20px;background:#f8f8f8;color:#888888;font-size:13px;">

                            © {{ date('Y') }} {{ config('app.name') }}.
                            All rights reserved.

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>