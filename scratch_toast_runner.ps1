
# 1. Play Windows Notification Chime
try {
    [System.Media.SystemSounds]::Asterisk.Play()
} catch {}

# 2. Fire Official WinRT Action Center Toast using registered PowerShell AUMID
try {
    $appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    
    $xml = @"
<toast duration="long">
    <visual>
        <binding template="ToastGeneric">
            <text>Hirna Security Dispatch</text>
            <text>Your One-Time Passkey (OTP) is: 778899</text>
            <text>Requested for superadmin@hirna.ph • Valid for 5 minutes.</text>
        </binding>
    </visual>
    <audio src="ms-winsoundevent:Notification.Default" />
</toast>
"@
    $doc = [Windows.Data.Xml.Dom.XmlDocument]::new()
    $doc.LoadXml($xml)
    $toast = [Windows.UI.Notifications.ToastNotification]::new($doc)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
} catch {}

# 3. Display Native Windows TopMost Desktop Toast Banner (guaranteed visual pop-up on desktop)
try {
    Add-Type -AssemblyName PresentationFramework, System.Drawing, WindowsBase, PresentationCore

    $xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Hirna Notification" Height="150" Width="380"
        WindowStyle="None" AllowsTransparency="True" Background="Transparent"
        Topmost="True" ShowInTaskbar="False" WindowStartupLocation="Manual">
    <Border Background="#0F172A" CornerRadius="16" BorderBrush="#334155" BorderThickness="1.5" Margin="8">
        <Border.Effect>
            <DropShadowEffect BlurRadius="20" ShadowDepth="4" Direction="270" Color="Black" Opacity="0.75"/>
        </Border.Effect>
        <Grid Margin="16,12,16,12">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="*"/>
            </Grid.RowDefinitions>
            
            <!-- Header Row -->
            <Grid Grid.Row="0">
                <StackPanel Orientation="Horizontal">
                    <Border Background="#2563EB" CornerRadius="4" Width="20" Height="20" Margin="0,0,8,0">
                        <TextBlock Text="✉" Foreground="White" FontSize="11" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                    <TextBlock Text="Windows Security • Action Center" Foreground="#94A3B8" FontSize="11" FontWeight="SemiBold" VerticalAlignment="Center"/>
                </StackPanel>
                <TextBlock Text="Just now" Foreground="#64748B" FontSize="10" HorizontalAlignment="Right" VerticalAlignment="Center"/>
            </Grid>
            
            <!-- Content Row -->
            <StackPanel Grid.Row="1" Margin="0,8,0,0">
                <TextBlock Text="Hirna Identity Verification (OTP)" Foreground="White" FontSize="13" FontWeight="Bold"/>
                <Border Background="#1E293B" CornerRadius="8" Padding="10,6" Margin="0,6,0,0" HorizontalAlignment="Left">
                    <TextBlock Text="Passkey: 778899" Foreground="#F59E0B" FontSize="15" FontWeight="ExtraBold" FontFamily="Consolas"/>
                </Border>
                <TextBlock Text="Sent to superadmin@hirna.ph • Valid for 5 mins" Foreground="#94A3B8" FontSize="10" Margin="0,4,0,0"/>
            </StackPanel>
        </Grid>
    </Border>
</Window>
"@
    $reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
    $win = [System.Windows.Markup.XamlReader]::Load($reader)

    $screen = [System.Windows.SystemParameters]::WorkArea
    $win.Left = $screen.Right - $win.Width - 12
    $win.Top = $screen.Bottom - $win.Height - 12

    $t = New-Object System.Windows.Threading.DispatcherTimer
    $t.Interval = [TimeSpan]::FromSeconds(9)
    $t.Add_Tick({
        $t.Stop()
        $win.Close()
    })
    $t.Start()

    $win.Add_MouseDown({
        $win.Close()
    })

    $win.ShowDialog() | Out-Null
} catch {}
