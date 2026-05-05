
 let page_name = window?.page_type || "";
    window.GA4User = {
        props: {
            login_status: "guest",
        },

        update(newProps) {
        this.props = { ...this.props, ...newProps };
        if (typeof gtag === "function") {
            gtag("set", "user_properties", this.props);
        }
         console.log("GA4 USER PROPS UPDATED:", this.props);
        },

        setState(state, userHash = null) {
            switch (state) {
                case "logged_in":
                    this.update({
                        login_status: "logged_in",
                        user_id: userHash
                    });
                    break;
                case "logged_out":
                    this.update({
                        login_status: "guest",
                        user_id: null 
                    });
                    break;
    
                default:
                this.update({
                    login_status: "guest"
                });
                delete this.props.user_id;
            }
        }
    };


    window.updateUserProperties = function () {
        const isLoggedIn = window?.sortdSsoObject?._isLoggedIn || false;
        const userHashId = window?.userHashId || null;
        if (isLoggedIn && userHashId) {
            window.GA4User.setState("logged_in", userHashId);
        } else {
           window.GA4User.setState();
        }
    }

    window.getClientIdFromGaCookie = function() {
        const gaCookie = document.cookie
            .split("; ")
            .find(row => row.startsWith("_ga="));
    
        if (!gaCookie) return null;
    
        const gaValue = gaCookie.split("=")[1]; 
        const parts = gaValue.split(".");
    
        if (parts.length < 4) return null;
    
        window.clientId = `${parts[2]}.${parts[3]}`;
        return 
   }

   
   

    class ssoBaseClass {
        _isLoggedIn;
        _isSubscribed;
        _profileObj;
        _subObj;

        constructor() {
            this._isLoggedIn = null;
            this._isSubscribed = null;
            this._profileObj = null;
            this._subObj = null;
        }
        
        getHashId(userInfo){
            let strToHash = userInfo.email || userInfo.phone_number;
            if (!strToHash) return null;
            let hashId = this.encodeBase64Url(strToHash);
           return hashId || null;

        }


        async init() {
            const userInfo = await this.checkLogin();
            if (userInfo) {
                this._isLoggedIn = true;
                this._profileObj = userInfo;
                
                if (userInfo?.subscription?.is_active) {
                    this._isSubscribed = true;
                    this._subObj = userInfo.subscription;
                }

                let userHashId = this.getHashId(userInfo);
                
                window.userHashId = userHashId;
                

                this.setProfile(userInfo);
                gtag('config', 'G-5TE4WFMYBS', {
                    'user_id': userHashId
                });

            } else {
                let loginButton = document.getElementById("trigger_login");
                let headerLoginButton = document.getElementById("trigger_login_top");
                if (loginButton) {
                    loginButton.onclick = this.initiateLogin.bind(this);
                }
                if(headerLoginButton) {
                    headerLoginButton.onclick = this.initiateLogin.bind(this);
                }
                window.userHashId = "guest";
            }
            return;
        }

        get isLoggedIn () {
            return this._isLoggedIn;
        }

        get isSubscribed () {
            return this._isSubscribed;
        }

        get profileObj () {
            return this._profileObj;
        }

        get subObj () {
            return this._subObj;
        }

        async checkLogin (){
            try{
                const user = this.getCookieByName('otlup');
                const rtis = this.getCookieByName('rtis');
                let userInfo = false;
                if(user){
                    userInfo = this.decodeJwtToken(user);
                    if (!rtis) { //remove this block after 15-12-2025
                        this.setCookieByName("rtis", 1, 10);
                    }
                }else{
                    if (!rtis) return;
                    let response = await this.postData('/post-actions/checklogin');
                    response = JSON.parse(response);
                    if(response.status){
                        userInfo = response.user_profile;
                    }
                }
                return userInfo;
            
            }catch(err){
                console.error("Error while Checking login status");
                console.error(err);
                return false;
            }
        }

        initiateLogin () {
            this.login();
        }
        
        async logout (){
            try{
                const user = this.getCookieByName("otlup");
                if(user){
                    let response = await this.postData("/post-actions/logout");
                    response = JSON.parse(response);
                    
                    this._isLoggedIn = false;
                    this._profileObj = null;
                    this._isSubscribed = false;
                    this._subObj = null;
        
                    const eventName = "logout";
                     window.GA4User.setState("logged_out");
                    if (typeof gtag === 'function') {
                        gtag('event', eventName);
                        gtag('config', 'G-5TE4WFMYBS', {
                            'user_id': null
                        });
                    }

                    setTimeout(this.logoutUiHandler, 2000);
                    this.logoutUiHandler();
                }
                return;

            } catch (err) {
                console.error(err)
            }
        }

        logoutUiHandler () {
            try {
                
                window.location.reload();

            } catch (err) {
                throw (err);
            }
        }

        setProfile (userProfile){
            try {
                const updateUiForPremiumUser = () => {
                    try {
                        const premiumLogo = `https://img.cdn.sortd.mobi/thetribune-sortd-pro-prod-sortd/header_branding:premium_brand_logo744b8c10-3261-11f0-a4cc-43dea7098306`;
                        
                        if (!premiumLogo) return;
                        if (!this._isSubscribed) return;
                        
                        let mobElements = document.getElementsByClassName("mob_brand_logo");
                        let desktopElements = document.getElementsByClassName("desktop_brand_logo");
                        
                        if (mobElements?.length) {

                            for (let i = 0; i < mobElements.length; i++) {
                                mobElements[i].src = premiumLogo;
                            }
                        }
                        if (desktopElements?.length) {

                            for (let i = 0; i < desktopElements.length; i++) {
                                if (desktopElements[i].tagName === "SOURCE") {
                                   //desktopElements[i].srcset = premiumLogo;
                                   desktopElements[i].setAttribute("media", "(max-width: 767px)");
                                   desktopElements[i].setAttribute("srcset", premiumLogo);
                                } else {
                                    desktopElements[i].src = premiumLogo;
                                }
                            }
                        }

                        return;

                    } catch (err) {
                        console.error(err);
                        return;
                    }
                }
                const updateUi = () => {

                    if(userProfile && !document.getElementById("ot_logout") && document.getElementById("vertical_menu")){
                        document.getElementById("vertical_menu").innerHTML += `<div class="ot_logout_div" id="ot_logout"><button onclick="sessionStorage.removeItem('tu_sub_cache'); ssoLogout()">Logout</button></div>`;
                    }

                    const ssoLogin = document.getElementById("ssoLogin");
                    const ssoTopLogin = document.getElementById('ssoTopLogin');
                    if (!ssoLogin || !ssoTopLogin) return;

                    ssoLogin.innerHTML = `
                        <span id="user_profile_area"> <a class="mysaccount_header" style="" href="/user/profile"> My Account </a> </span>
                        <ul class="sub-menu sub_level_1" id="sub-login" style="background:#0d1c3d;display: none;">
                            ${userProfile.name ? 
                            `<li style="color:#ffffff"> 
                                <span id="user_name" onclick="window.location.href='/user/profile'">${userProfile.name} </span>
                                <span class="sparator"> &nbsp;| </span>
                            </li>` : ""}
                            ${userProfile.email ? 
                            `<li style="color:#ffffff;">
                                <span id="user_email" onclick="window.location.href='/user/profile'">${userProfile.email} </span>
                            </li>` : ""}
                            ${userProfile.phone_number ? 
                            `<li style="color:#ffffff;">
                                <span onclick="window.location.href='/user/profile'">${userProfile.phone_number} </span>
                            </li>` : ""}
                            
                        </ul>`;

                    ssoTopLogin.innerHTML = `
                        <span id="user_profile_img"> <a class="mysaccount_header" style="color: black !important" href="/user/profile"> 
                            <img style= "border-radius: 50%; height: 28px !important; background: #e6e6e6 !important; overflow: hidden !important;" src="${userProfile?.picture ? userProfile?.picture: '/images/userProfileIcon.png'}" width='20' height='20'>
                         </a> </span>
                        
                        <ul class="sub-menu sub_level_1" id="sub-login-top" style="background:#0d1c3d;display: none;">
                            ${userProfile.name ? 
                            `<li style="color:#ffffff"> 
                                <span id="user_name_top" onclick="window.location.href='/user/profile'">${userProfile.name} </span>
                                <span class="sparator"> &nbsp;| </span>
                            </li>` : ""}
                            ${userProfile.email ? 
                            `<li style="color:#ffffff;">
                                <span id="user_email_top" onclick="window.location.href='/user/profile'">${userProfile.email} </span>
                            </li>` : ""}
                            ${userProfile.phone_number ? 
                            `<li style="color:#ffffff;">
                                <span onclick="window.location.href='/user/profile'">${userProfile.phone_number} </span>
                            </li>` : ""}
                        </ul>`;

                    updateUiForPremiumUser();
                    return;
                }

                this.execPostDomLoad(updateUi);
                return;

            } catch (err) {
                throw (err);
            }
        }

        execPostDomLoad (fn) {
            try {
                if (document.readyState === "loading") {
                    console.log("load function after dom load =>", document.readyState);
                    document.addEventListener("DOMContentLoaded", () => {
                        console.log("executing functoin after dom load")
                        fn();
                    })
                    return;
                }
                return fn();
            } catch (err) {
                throw (err);
            }
        }

        async postData (url, data = ''){
            try{

                const response = await fetch(url,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: data
                });

                if(!response.ok){
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const responseData = await response.text();
                return responseData;

            }catch(err){
                console.log("Error while posting data")
                throw(err);
            }
        }

        getCookieByName (cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for(let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
                }
            }
            return "";
        }


        setCookieByName(cname, cvalue, exdays) {
            const d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        decodeJwtToken (token){
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        }

        encodeBase64Url(input) {
            let encoded = btoa(unescape(encodeURIComponent(input)));
            
            encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            
            return encoded;
        }

        decodeBase64Url(encodedUrl) {
            encodedUrl = encodedUrl.replace(/,/g, '');

            encodedUrl = encodedUrl.replace(/-/g, '+').replace(/_/g, '/');

            while (encodedUrl.length % 4 !== 0) {
                encodedUrl += '=';
            }

            return decodeURIComponent(escape(atob(encodedUrl)));
        }

        triggerGoogleAnalytics (eventName, eventObj = false) {
            try {
                if (typeof gtag === 'function') {
                
                if (eventObj) {
                gtag('event', eventName, {
                    ...eventObj,
                    transport_type: 'beacon'   
                });
                } else {
                gtag('event', eventName, {
                    transport_type: 'beacon'
                });
                }
             }
                return;
           } catch (err) {
                throw (err);
            }
        }

    }

    class sortdOneTapLogin extends ssoBaseClass {

        constructor() {
            super();
        }

        async init () {
            await super.init();
            if (!this._isLoggedIn) {
                this.displayOneTapLogin();
            }
        }

        displayOneTapLogin (){
            try{
                const display = () => {

                    let loginWithHtml = document.getElementById('google_login_html');
                    if (loginWithHtml) {
                        loginWithHtml.innerHTML = loginButtonHtml;
                    } else {
                        let body = document.getElementsByTagName("body");
                        body[0].innerHTML += loginHtml;
                    }

                    let scriptArr = document.getElementsByClassName("g_login_script");
                    let src = null;
                    if (scriptArr && scriptArr.length) {
                        src = scriptArr[0].src;
                        //scriptArr[0].remove();
                    }
                    console.log("src =>", src);
                    if (!src) {
                        console.log("src is not available");
                        console.log("scriptArr =>", scriptArr);
                        console.log("dom status =>", document.readyState);
                        return;
                    }
                    let newScript = document.createElement('script');
                    newScript.classList.add("g_login_script");
                    newScript.src = src;
                    document.getElementsByTagName('head')[0].appendChild(newScript);

                    return;
                }

                this.execPostDomLoad(display);

            } catch (err) {
                console.log(err);
                return;
            }
        }

        initiateLogin (autoSubscribe) {
            sessionStorage.removeItem('tu_sub_cache');
            sessionStorage.removeItem('tu_sub_cookie_ref');
            sessionStorage.setItem('tu_login_pending', 'true');
            let currentUrl = window.location.href;
            let paramsTracker = {};
            let params = new URLSearchParams(window.location.search);
            
            params.entries().forEach(entry => {
                paramsTracker[entry[0]] = entry[1];
            })

            if (!paramsTracker.hasOwnProperty("referrer")) {
                paramsTracker["referrer"] = currentUrl.split("?")[0];
            }

            if (subscriptionModalEnabled) {
                if (currentUrl === window.location.origin + "/subscription") {
                    //currentUrl = window.location.origin;
                    paramsTracker.referrer = window.location.origin;
                }
                if (!paramsTracker.hasOwnProperty("autosubscribe")) {
                    paramsTracker["autosubscribe"] = true;
                }
                //callback = `${window.location.origin}/subscription?autosubscribe=true&referrer=${currentUrl}`
            }
            
            let callback = window.location.origin + "/subscription"
            let referrer = "";

            Object.keys(paramsTracker).forEach((key, index) => {
                let str = "";
                if (index === 0) {
                    str += "?";
                } else {
                    str += "&";
                }
                str += `${key}=${paramsTracker[key]}`;
                if (key ===  "referrer") {
                    referrer = str;
                } else {
                    callback += str;
                }
            })

            callback += referrer;
            
            window.location.href = window.location.origin + "/login?callback=" + callback;
        }

        async login (data){
            try {
                let response = await this.postData("/post-actions/onetaplogin", JSON.stringify(data))
                response = JSON.parse(response);
                if(!response.status){
                    console.log("Error While Logging In")
                    return;
                }
                await this.init();
                const event = new Event ("userLoggedIn");
                document.dispatchEvent(event); 
                return;

            } catch (err) {
                console.error(err);
            }
        }
    }

    class rwConnect extends ssoBaseClass {

        constructor () {
            super();
            this._loginDependenciesLoaded = false;
            this._ga4ListenerAdded = false;
        }

        async init() {
            await super.init();
            if (!this._isLoggedIn && !this.isUserSessionActive()) {
                await this.ensureLoginDependenciesLoaded();
            }
        }

        isUserSessionActive() {
            const sessionKey = 'rwUserSessionTracked';

            if (sessionStorage.getItem(sessionKey)) {
                return true;
            }

            sessionStorage.setItem(sessionKey, 'true');
            return false;
        }

        async ensureLoginDependenciesLoaded() {
            if (!this._loginDependenciesLoaded) {
                await this.loadLoginDependencies();
            }
        }

        async loadLoginDependencies () {
            try {

                function loadJs (resolve) {
                    let scriptArr = document.getElementsByClassName("rw_login_script");
                    let src = null;
                    if (scriptArr && scriptArr.length) {
                        src = scriptArr[0].src;
                        scriptArr[0].remove();
                    }

                    let newScript = document.createElement('script');
                    newScript.classList.add("rw_login_script");
                    newScript.src = src;

                    newScript.addEventListener('load', resolve);
                    newScript.addEventListener('error', resolve);


                    document.getElementsByTagName('head')[0].appendChild(newScript);
                }

                await new Promise (resolve => loadJs (resolve));
                
                    RW.init({
                        appId: '1747057084',
                        enable_google_one_tap: true, 
                        google_client_id: '800189477123-b8cfsudapr2m1lteqcmshgmm424fo2vr.apps.googleusercontent.com' 
                    });
                
                //add listeners for events
                this._loginDependenciesLoaded = true;
                this.addGa4EventListener();

            } catch (err) {
                throw (err);
            }
        }

        async loginAsync () {
            try {
                await this.ensureLoginDependenciesLoaded();
                RW.login(function(response) {});

                window.addEventListener('message', function(event) {
    
                    if (event.origin !== "https://www.readwhere.com" || !event?.data?.action) {
                        return;
                    }
                    
                    let redirectUrl = "";
                    switch (event.data.action) {
                        case "googleLogin":
                        case "facebookLogin":
                            redirectUrl = event.data.url;
                            break;
                    }
                    
                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    }
                    
                });

                return;

            } catch (err) {
                console.error(err);
            }
        }

        login () {
            this.loginAsync().catch(err => console.error(err));
        }

        addGa4EventListener () {
            try {
                if (this._ga4ListenerAdded) return;
                    this._ga4ListenerAdded = true;
                window.addEventListener('message', (event) => {
                    if (event.origin !== 'https://www.readwhere.com') {
                        return;
                    }
                    console.log("pagename " ,page_name)
                    const message = event.data;
                    console.log('Received message from iframe:', message);

                    let eventName = "";
                    let eventObj = {}
                    let customEvent ='';
                    switch (message.event) {
                        case 'login_otp_requested':
                            console.log('Received message from iframe login_otp_requested:', message);
                            eventName = "login_otp_requested";
                            eventObj = {
                                user_source: message.user_source
                            }
                            break;

                        case 'login_otp_submitted':
                            console.log('Received message from iframe login_otp_submitted:', message);
                            eventName = "login_otp_submitted";
                            eventObj = {
                                user_source: message.user_source
                            }
                            break;

                        case 'signup_otp_requested':
                            console.log('Received message from iframe signup_otp_requested:', message);
                            console.log("events are temp not firing. Done on purpose");
                            break;

                        case 'signup_start':
                            console.log('Received message from iframe signup_start:', message);
                            eventName = "signup_start";
                            break;

                        case 'signup':
                            console.log('Received message from iframe signup_start:', message);
                            eventName = "signup";
                            eventObj = {
                                user_source: message.user_source
                            }
                            customEvent = "sign_up";
                            break;
                        case 'login_success':
                            console.log('Received message from iframe login_success:', message);
                            eventName = "login_success";
                            eventObj = {
                                user_source: message.user_source
                            }
                            customEvent = "login";
                            break;
                            
                        default:
                            console.log('Unknown event:', message.event);
                    }

                    if (eventName) {
                        this.triggerGoogleAnalytics(eventName, eventObj);
                    }
                    if(customEvent){
                        this.triggerGoogleAnalytics(customEvent,{page_type : page_name ,client_id_event: window.clientId || "unknown"});
                    }
                });
                console.log("All the listerners are added for capturing ga4 events")
            } catch (err) {
                console.log(err);
            }
        }
    }


    const initSsoObject = async function () {
      try {
        if (window.sortdSsoLoaded) {
            console.log("sso is already initialized");
            return;
        }

        let ssoObj = false;
        
        
            ssoObj = new rwConnect();

        if (!ssoObj) {
            window.sortdSsoLoaded = true;
            window.sortdSsoObject = null;
            return;
        }

        await ssoObj.init();

        ssoLogin = ssoObj.login.bind(ssoObj);
        ssoLogout = ssoObj.logout.bind(ssoObj);
        window.sortdSsoLoaded = true;
        window.sortdSsoObject = ssoObj;
        window.updateUserProperties();
        window.getClientIdFromGaCookie();
        console.log(ssoObj)
        console.log("Sortd SSO Loaded")

      } catch (err) {
        console.error(err);
      } 
    }

    window.addEventListener("pageshow", ()=>{
        initSsoObject();
    });

    initSsoObject();


    
