<body>
<script type="text/javascript">
var configuration = {
  widgetId: "3663446a725a363934363033",
  tokenAuth: "495150T9dnXSDMY69a09988P1",
  identifier: "<enter mobile number/email here> (optional)",
  exposeMethods: "<true | false> (optional)",  // When true will expose the methods for OTP verification. Refer 'How it works?' for more details
  success: (data) => {
      // get verified token in response
      console.log('success response', data);
  },
  failure: (error) => {
      // handle error
      console.log('failure reason', error);
  },
    "OTP": "<OTP>"
};
</script>
<script type="text/javascript">
(function loadOtpScript(urls) {
    let i = 0;
    function attempt() {
        const s = document.createElement('script');
        s.src = urls[i];
        s.async = true;
        s.onload = () => {
            if (typeof window.initSendOTP === 'function') {
                window.initSendOTP(configuration);
            }
        };
        s.onerror = () => {
            i++;
            if (i < urls.length) {
                attempt();
            }
        };
        document.head.appendChild(s);
    }
    attempt();
})([
    'https://verify.msg91.com/otp-provider.js',
    'https://verify.phone91.com/otp-provider.js'
]);
</script>
</body>

curl --location --request POST
  'https://control.msg91.com/api/v5/widget/verifyAccessToken'
  --header 'Content-Type: application/json'
  --data-raw '{
  "authkey": "{Your MSG91 AuthKey}",
  "access-token": "{jwt_token_from_otp_widget}"
}'
