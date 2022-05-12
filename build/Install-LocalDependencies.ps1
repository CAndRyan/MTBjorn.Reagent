#

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("all", "hypotenuse")]
    [string]
    $Package
)

if ($Package -eq "all") {
    $scriptPath = Join-Path $PSScriptRoot $MyInvocation.MyCommand.Name
    & $scriptPath -Package "hypotenuse"
    return
}

if ($Package -eq "hypotenuse") {
    $packageName = "MTBjorn.Hypotenuse"
} else {
    throw "Invalid package '$Package'"
}

$packagePath = Join-Path $PSScriptRoot "..\..\$packageName" -Resolve
& $(Join-Path $PSScriptRoot "Install-LocalNpmPackage.ps1") -Path $packagePath
