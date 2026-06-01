<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Techno Tronics')</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #1a1a2e; padding: 24px 32px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .header p { color: #0066cc; margin: 4px 0 0; font-size: 14px; }
        .content { padding: 32px; }
        .footer { background-color: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background-color: #0066cc; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .table th { background-color: #1a1a2e; color: #ffffff; padding: 10px 12px; text-align: left; font-size: 13px; }
        .table td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .total-row { font-weight: bold; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .badge-pending { background-color: #fff3cd; color: #856404; }
        .badge-verified { background-color: #d1edff; color: #0066cc; }
        .badge-delivered { background-color: #d4edda; color: #155724; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Techno Tronics</h1>
        <p>Premium Electronics - Mauritius</p>
    </div>
    <div class="content">
        @yield('content')
    </div>
    <div class="footer">
        <p>Techno Tronics Ltd | Royal Road, Quatre Bornes, Mauritius</p>
        <p>Tel: +230 5800 0000 | Email: info@technotronics.mu</p>
        <p>BRN: C12345678 | VAT Reg: VAT12345678</p>
    </div>
</div>
</body>
</html>
