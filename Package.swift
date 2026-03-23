// swift-tools-version: 6.0
import PackageDescription

let package = Package(
   name: "Site",
   platforms: [.macOS(.v14)],
   dependencies: [
      .package(url: "https://github.com/FlineDev/SiteKit-Package.git", branch: "main"),
   ],
   targets: [
      .executableTarget(
         name: "Site",
         dependencies: [
            .product(name: "SiteKit", package: "SiteKit-Package"),
         ]
      ),
   ]
)
