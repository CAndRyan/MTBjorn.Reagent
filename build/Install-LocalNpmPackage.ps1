#
# NPM's symbolic linking (e.g. npm install pathToLocalPackage) doesn't play well with file path resolution for resources loaded into Webpack
# This alternative will pack a local package into a tarball & install as a dependency without symlinks
#

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true, HelpMessage="Provide path to local package's root directory")]
    [ValidateScript({ Test-Path -Path $_ -PathType Container })]
    [string]
    $Path,

    [Parameter(Mandatory=$false, HelpMessage="Provide path to output package tarballs")]
    [ValidateScript({ Test-Path -Path $_ -PathType Container })]
    [string]
    $TarballDirectory = $(Join-Path $PSScriptRoot "local_tarballs")
)

if (-not (Test-Path -Path $(Join-Path $Path "package.json"))) {
    throw "Provided path does not reference a package"
}

$rootDirectory = Join-Path $PSScriptRoot "../"
$fullPackagePath = Resolve-Path $Path |Select-Object -ExpandProperty Path
$fullTarballDirectory = Resolve-Path $TarballDirectory |Select-Object -ExpandProperty Path

[System.IO.Directory]::CreateDirectory($fullTarballDirectory) |Out-Null
Push-Location $fullTarballDirectory
Push-Location $fullPackagePath

try {
    & npm run build
    popd

    $packJson = & npm pack $fullPackagePath --json --ignore-scripts
    $tarballFileName = ($packJson |ConvertFrom-Json).filename
    $tarballPath = Join-Path $fullTarballDirectory $tarballFileName

    Set-Location $rootDirectory

    & npm install $tarballPath
} finally {
    Pop-Location
}
