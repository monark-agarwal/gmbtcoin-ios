Pod::Spec.new do |s|
  s.name             = "Mobile"
  s.version          = "1.0.0"
  s.summary          = "Go Mobile XCFramework for GLMT Wallet"
  s.description      = "GoMobile generated XCFramework used for wallet cryptography and transaction signing."

  s.homepage         = "https://example.com"
  s.license          = { :type => "MIT", :text => "MIT License" }
  s.author           = { "GLMT" => "dev@example.com" }

  s.platform         = :ios, "15.1"
  s.source           = { :path => "." }

  s.vendored_frameworks = "Mobile.xcframework"
  s.static_framework = true
  s.requires_arc     = true
end