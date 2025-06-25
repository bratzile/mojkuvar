$path = ".\android\capacitor-cordova-android-plugins\build.gradle"

if (Test-Path $path) {
    (Get-Content $path) -replace 'JavaVersion.VERSION_21', 'JavaVersion.VERSION_17' | Set-Content $path
    Write-Output "build.gradle izmenjen: VERSION_21 na VERSION_17"
} else {
    Write-Output "build.gradle nije pronađen. Da li si dodao Android platformu?"
}
