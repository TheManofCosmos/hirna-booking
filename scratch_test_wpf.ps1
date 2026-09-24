
Add-Type -AssemblyName PresentationFramework, System.Drawing, WindowsBase, PresentationCore

$title = "Hirna Security Dispatch"
$code = "582914"
$email = "superadmin@hirna.ph"

# Play Windows Asterisk / Notification Sound
[System.Media.SystemSounds]::Asterisk.Play()

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Hirna Notification" Height="140" Width="360"
        WindowStyle="None" AllowsTransparency="True" Background="Transparent"
        Topmost="True" ShowInTaskbar="False" WindowStartupLocation="Manual">
    <Border Background="#1E293B" CornerRadius="16" BorderBrush="#334155" BorderThickness="1.5" Margin="8">
        <Border.Effect>
            <DropShadowEffect BlurRadius="18" ShadowDepth="4" Direction="270" Color="Black" Opacity="0.6"/>
        </Border.Effect>
        <Grid Margin="16,12,16,12">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="*"/>
            </Grid.RowDefinitions>
            
            <!-- Header Row -->
            <Grid Grid.Row="0">
                <StackPanel Orientation="Horizontal">
                    <Border Background="#2563EB" CornerRadius="4" Width="18" Height="18" Margin="0,0,8,0">
                        <TextBlock Text="✉" Foreground="White" FontSize="11" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    </Border>
                    <TextBlock Text="Windows Security • Mail" Foreground="#94A3B8" FontSize="11" FontWeight="SemiBold" VerticalAlignment="Center"/>
                </StackPanel>
                <TextBlock Text="Just now" Foreground="#64748B" FontSize="10" HorizontalAlignment="Right" VerticalAlignment="Center"/>
            </Grid>
            
            <!-- Content Row -->
            <StackPanel Grid.Row="1" Margin="0,8,0,0">
                <TextBlock Text="Hirna Identity Verification" Foreground="White" FontSize="13" FontWeight="Bold"/>
                <TextBlock Text="Passkey: 582914 (Valid for 5 mins)" Foreground="#F59E0B" FontSize="12" FontWeight="Bold" FontFamily="Consolas" Margin="0,4,0,0"/>
                <TextBlock Text="Requested for superadmin@hirna.ph" Foreground="#94A3B8" FontSize="10" Margin="0,2,0,0"/>
            </StackPanel>
        </Grid>
    </Border>
</Window>
"@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

# Position at bottom-right of primary screen above taskbar
$screen = [System.Windows.SystemParameters]::WorkArea
$window.Left = $screen.Right - $window.Width - 10
$window.Top = $screen.Bottom - $window.Height - 10

$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromSeconds(8)
$timer.Add_Tick({
    $timer.Stop()
    $window.Close()
})
$timer.Start()

$window.Add_MouseDown({
    $window.Close()
})

$window.ShowDialog() | Out-Null
