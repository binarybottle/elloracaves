if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
} else {
  
} 

try {window.RW || (function(window) { 
  var self = window, document = window.document;
  var setTimeout = window.setTimeout, setInterval = window.setInterval;var __DEV__ = 0;var ENVIRONMENT = 3;var rwdomain;
        if(ENVIRONMENT == 1) {
          rwdomain = 'https://localrwstore16.com/';
        } else if(ENVIRONMENT == 2) {
          rwdomain = 'https://readwhere.app/';
        } else {
          rwdomain = 'https://www.readwhere.com/';
          //rwdomain = ('https:' == document.location.protocol) ? 'https://www.readwhere.com/' : 'http://www.readwhere.com/';
          //rwdomain = 'https://www.readwhere.com/';
        } 

        var linkElement = document.getElementById("logout");
        if (linkElement) {
            // Modify the href property
            linkElement.href = rwdomain+'user/logout?domain='+window.location.origin+'&cont=home'
        }
  
function getUserCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}  
   // --- GOOGLE ONE TAP SUPPORT START ---
function loadGoogleOneTap(clientId, callback) {
  if (!clientId || typeof window !== 'object') return;
  var script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = function () {
    callback && callback();
  };
  document.head.appendChild(script);
}

function handleGoogleCredential(idToken) {

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = rwdomain + 'user/onetaplogin';

    const data = {
      token: idToken,
      main_window_url: self.location.href
    };

    // Convert to hidden inputs
    for (const key in data) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }

    // Submit the form
    document.body.appendChild(form);
    form.submit();
}
// --- GOOGLE ONE TAP SUPPORT END ---
  
  
  function emptyFunction() {};
        var require, __d;
  (function (global) { 
    var map = {}, resolved = {};
    /**
     * The default dependencies required by all functions
     */
    var defaultDeps = ['global', 'require', 'requireDynamic', 'requireLazy', 'module', 'exports'];
    /**
     * Get the function from the global map variable 
     * Call all its dependent functions first, then call the function specified by id
     * @param id{String} The name of the function
     * @param soft{boolean} Whether an error should be returned if the function is not found 
     *                      in global map variable, false by default
     */
    require = function(id,soft) { 
      if (resolved.hasOwnProperty(id)) {
        return resolved[id];
      }
      if (!map.hasOwnProperty(id)) {
        if (soft) {
          return null;
        }
        throw new Error('Module ' + id + ' has not been defined');
      }
      var module = map[id],
          deps = module.deps,
          length = deps.length,
          dep,
          args = []; 
      for (var i = 0; i < length; i++) {  
        switch(deps[i]) {
          case 'module'        :dep = module;break;
          case 'exports'       :dep = module.exports;break;
          case 'global'        :dep = global;break;
          case 'require'       :dep = require;break;
          case 'requireDynamic':dep = require;break;
          case 'requireLazy'   :dep = null;break;
          default              :dep = require(deps[i]);
        }
        args.push(dep);
      }
      module.factory.apply(global, args);
      resolved[id] = module.exports;
      return module.exports;
    };
    /**
     * The definiton of the __d function
     */
    __d = function(id,deps,factory,_special) {
      switch(typeof factory) {
        case  'function':
          map[id] = {
            factory: factory,
            deps: defaultDeps.concat(deps),
            exports: {}
          };
          // 3 signifies that this should be executed immediately
          if (_special === 3) {
            require(id);
          }
          break;
        case 'object':
          resolved[id] = factory;
          break;
        default:
          throw new TypeError('Wrong type for factory object');
      }
    };
  })(this);
  
  /**
   * Contains all the css styles to be included with js 
   */
  
  __d("CssConfig", [], {
    "rules": ".fb_hidden{position:fixed;top:-10000px;z-index:10001}\n.fb_invisible{display:none}\n#rw-root{width:100%;float:left;display: block;top:0px;z-index:9999;}\n.fb_reset{background:none;border:0;border-spacing:0;color:#000;cursor:auto;direction:ltr;font-family:\"lucida grande\", tahoma, verdana, arial, sans-serif;font-size:11px;font-style:normal;font-variant:normal;font-weight:normal;letter-spacing:normal;line-height:1;margin:0;overflow:visible;padding:0;text-align:left;text-decoration:none;text-indent:0;text-shadow:none;text-transform:none;visibility:visible;white-space:normal;word-spacing:normal}\n.fb_reset > div{overflow:hidden}\n.fb_link img{border:none}\n.rw_dialog{background:#fff;text-align: left !important;box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);position:absolute;z-index:10001}\n.rw_dialog_advanced{-moz-border-radius:8px;-webkit-border-radius:8px;border-radius:8px}\n.rw_dialog_content{background:#fff;color:#333;overflow-y: auto;webkit-overflow-scrolling: touch}\n.rw_dialog_close_icon{background:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/yq\/r\/IE9JII6Z1Ys.png) no-repeat scroll 0 0 transparent;_background-image:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/yL\/r\/s816eWC-2sl.gif);cursor:pointer;display:block;height:15px;position:absolute;right:18px;top:17px;width:15px;top:8px\\9;right:7px\\9}\n.rw_dialog_mobile .rw_dialog_close_icon{top:5px;left:5px;right:auto}\n.rw_dialog_padding{background-color:transparent;position:absolute;width:1px;z-index:-1}\n.rw_dialog_close_icon:hover{background:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/yq\/r\/IE9JII6Z1Ys.png) no-repeat scroll 0 -15px transparent;_background-image:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/yL\/r\/s816eWC-2sl.gif)}\n.rw_dialog_close_icon:active{background:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/yq\/r\/IE9JII6Z1Ys.png) no-repeat scroll 0 -30px transparent;_background-image:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/yL\/r\/s816eWC-2sl.gif)}\n.rw_dialog_loader{background-color:#f2f2f2;border:1px solid #606060;font-size:24px;padding:20px}\n.rw_dialog_top_left,\n.rw_dialog_top_right,\n.rw_dialog_bottom_left,\n.rw_dialog_bottom_right{height:10px;width:10px;overflow:hidden;position:absolute}\n\/* \u0040noflip *\/\n.rw_dialog_top_left{left:-10px;top:-10px}\n\/* \u0040noflip *\/\n.rw_dialog_top_right{right:-10px;top:-10px}\n\/* \u0040noflip *\/\n.rw_dialog_bottom_left{bottom:-10px;left:-10px}\n\/* \u0040noflip *\/\n.rw_dialog_bottom_right{right:-10px;bottom:-10px}\n.rw_dialog_vert_left,\n.rw_dialog_vert_right,\n.rw_dialog_horiz_top,\n.rw_dialog_horiz_bottom{position:absolute;filter:alpha(opacity=70);opacity:.7}\n.rw_dialog_vert_left,\n.rw_dialog_vert_right{width:10px;height:100\u0025}\n.rw_dialog_vert_left{margin-left:-10px}\n.rw_dialog_vert_right{right:0;margin-right:-10px}\n.rw_dialog_horiz_top,\n.rw_dialog_horiz_bottom{width:100\u0025;height:10px}\n.rw_dialog_horiz_top{margin-top:-10px}\n.rw_dialog_horiz_bottom{bottom:0;margin-bottom:-10px}\n.rw_dialog_iframe{line-height:0}\n.rw_dialog_content .dialog_title{background:url('https://www.readwhere.com/images/readwhere-tiles_bg.png') repeat-x 0 -9px;border:1px solid #3b5998;color:#fff;font-size:14px;font-weight:bold;margin:0}\n.rw_dialog_content .dialog_title > span{background:url('https://www.readwhere.com/design-elements/images/rw-logo-small.png')\nno-repeat 5px 50\u0025;float:left;padding:5px 0 7px 26px}\nbody.fb_hidden{-webkit-transform:none;height:100\u0025;margin:0;left:-10000px;overflow:visible;position:absolute;top:-10000px;width:100\u0025\n}\n.rw_dialog.rw_dialog_mobile.loading{background:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/ya\/r\/3rhSv5V8j3o.gif)\nwhite no-repeat 50\u0025 50\u0025;min-height:100\u0025;min-width:100\u0025;overflow:hidden;position:absolute;top:0;z-index:10001}\n.rw_dialog.rw_dialog_mobile.loading.centered{max-height:590px;min-height:590px;max-width:500px;min-width:500px}\n#fb-root #rw_dialog_ipad_overlay{background:rgba(0, 0, 0, .45);position:absolute;left:0;top:0;width:100\u0025;min-height:100\u0025;z-index:10000}\n#fb-root #rw_dialog_ipad_overlay.hidden{display:none}\n.rw_dialog.rw_dialog_mobile.loading iframe{visibility:hidden}\n.rw_dialog_content .dialog_header{-webkit-box-shadow:white 0 1px 1px -1px inset;background:-webkit-gradient(linear, 0 0, 0 100\u0025, from(#738ABA), to(#2C4987));border-bottom:1px solid;border-color:#1d4088;color:#fff;font:14px Helvetica, sans-serif;font-weight:bold;text-overflow:ellipsis;text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0;vertical-align:middle;white-space:nowrap}\n.rw_dialog_content .dialog_header table{-webkit-font-smoothing:subpixel-antialiased;height:43px;width:100\u0025\n}\n.rw_dialog_content .dialog_header td.header_left{font-size:12px;padding-left:5px;vertical-align:middle;width:60px\n}\n.rw_dialog_content .dialog_header td.header_right{font-size:12px;padding-right:5px;vertical-align:middle;width:60px\n}\n.rw_dialog_content .touchable_button{background:-webkit-gradient(linear, 0 0, 0 100\u0025, from(#4966A6),\ncolor-stop(0.5, #355492), to(#2A4887));border:1px solid #29447e;-webkit-background-clip:padding-box;-webkit-border-radius:3px;-webkit-box-shadow:rgba(0, 0, 0, .117188) 0 1px 1px inset,\nrgba(255, 255, 255, .167969) 0 1px 0;display:inline-block;margin-top:3px;max-width:85px;line-height:18px;padding:4px 12px;position:relative}\n.rw_dialog_content .dialog_header .touchable_button input{border:none;background:none;color:#fff;font:12px Helvetica, sans-serif;font-weight:bold;margin:2px -12px;padding:2px 6px 3px 6px;text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0}\n.rw_dialog_content .dialog_header .header_center{color:#fff;font-size:16px;font-weight:bold;line-height:18px;text-align:center;vertical-align:middle}\n.rw_dialog_content .dialog_content{max-height: 400px}\n.rw_dialog_content .dialog_footer{background:#f2f2f2;border:1px solid #555;border-top-color:#ccc;height:40px}\n#rw_dialog_loader_close{float:left}\n.rw_dialog.rw_dialog_mobile .rw_dialog_close_button{text-shadow:rgba(0, 30, 84, .296875) 0 -1px 0}\n.rw_dialog.rw_dialog_mobile .rw_dialog_close_icon{visibility:hidden}\n.fb_iframe_widget{display:inline-block;position:relative}\n.fb_iframe_widget span{display:inline-block;position:relative;text-align:justify}\n.fb_iframe_widget iframe{position:absolute}\n.fb_iframe_widget_lift{z-index:1}\n.fb_hide_iframes iframe{position:relative;left:-10000px}\n.fb_iframe_widget_loader{position:relative;display:inline-block}\n.fb_iframe_widget_fluid{display:inline}\n.fb_iframe_widget_fluid span{width:100\u0025}\n.fb_iframe_widget_loader iframe{min-height:32px;z-index:2;zoom:1}\n.fb_iframe_widget_loader .FB_Loader{background:url(https:\/\/static.ak.fbcdn.net\/rsrc.php\/v2\/y9\/r\/jKEcVPZFk-2.gif) no-repeat;height:32px;width:32px;margin-left:-16px;position:absolute;left:50\u0025;z-index:4}\n.fb_connect_bar_container div,\n.fb_connect_bar_container span,\n.fb_connect_bar_container a,\n.fb_connect_bar_container img,\n.fb_connect_bar_container strong{background:none;border-spacing:0;border:0;direction:ltr;font-style:normal;font-variant:normal;letter-spacing:normal;line-height:1;margin:0;overflow:visible;padding:0;text-align:left;text-decoration:none;text-indent:0;text-shadow:none;text-transform:none;visibility:visible;white-space:normal;word-spacing:normal;vertical-align:baseline}\n.fb_connect_bar_container{position:fixed;left:0 !important;right:0 !important;height:42px !important;padding:0 25px !important;margin:0 !important;vertical-align:middle !important;border-bottom:1px solid #333 !important;background:#3b5998 !important;z-index:99999999 !important;overflow:hidden !important}\n.fb_connect_bar_container_ie6{position:absolute;top:expression(document.compatMode==\"CSS1Compat\"? document.documentElement.scrollTop+\"px\":body.scrollTop+\"px\")}\n.fb_connect_bar{position:relative;margin:auto;height:100\u0025;width:100\u0025;padding:6px 0 0 0 !important;background:none;color:#fff !important;font-family:\"lucida grande\", tahoma, verdana, arial, sans-serif !important;font-size:13px !important;font-style:normal !important;font-variant:normal !important;font-weight:normal !important;letter-spacing:normal !important;line-height:1 !important;text-decoration:none !important;text-indent:0 !important;text-shadow:none !important;text-transform:none !important;white-space:normal !important;word-spacing:normal !important}\n.fb_connect_bar a:hover{color:#fff}\n.fb_connect_bar .fb_profile img{height:30px;width:30px;vertical-align:middle;margin:0 6px 5px 0}\n.fb_connect_bar div a,\n.fb_connect_bar span,\n.fb_connect_bar span a{color:#bac6da;font-size:11px;text-decoration:none}\n.fb_connect_bar .fb_buttons{float:right;margin-top:7px}\n.fb_edge_widget_with_comment{position:relative;*z-index:1000}\n.fb_edge_widget_with_comment span.fb_edge_comment_widget{position:absolute}\n.fb_edge_widget_with_comment span.fb_send_button_form_widget{z-index:1}\n.fb_edge_widget_with_comment span.fb_send_button_form_widget .FB_Loader{left:0;top:1px;margin-top:6px;margin-left:0;background-position:50\u0025 50\u0025;background-color:#fff;height:150px;width:394px;border:1px #666 solid;border-bottom:2px solid #283e6c;z-index:1}\n.fb_edge_widget_with_comment span.fb_send_button_form_widget.dark .FB_Loader{background-color:#000;border-bottom:2px solid #ccc}\n.fb_edge_widget_with_comment span.fb_send_button_form_widget.siderender\n.FB_Loader{margin-top:0}\n.fbpluginrecommendationsbarleft,\n.fbpluginrecommendationsbarright{position:fixed !important;bottom:0;z-index:999}\n\/* \u0040noflip *\/\n.fbpluginrecommendationsbarleft{left:10px}\n\/* \u0040noflip *\/\n.fbpluginrecommendationsbarright{right:10px}\n.rw_iframe{padding:0px !important;background:none !important;margin-top: -10px !important;}\n.login_trans_bg{background:rgba(0,0,0,0.8);position: absolute;top: 0;left: 0;right: 0;bottom: 0;width: auto;z-index: 1020;opacity: 0.8;}\n.scroller_hidden{overflow:hidden;}"
  });
  
  __d("QueryString",[],function(global,require,requireDynamic,requireLazy,module,exports) { 
      
      /**
       * Encode parameters to a query string.
       * @access private
       * @param   bags {Object}  the parameters to encode
       * @return        {String}  the query string
       */
      function encode(bag) {
        var pairs = [];
        for(var key in bag) {
          var value = bag[key];
          if (typeof value === 'undefined') {
            continue;
          }
          if (value === null) {
            pairs.push(key);
            return;
          }
          pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
        return pairs.join('&');
      }
       /**
         * Decode a query string into a parameters object.
         *
         * @access private
         * @param   str {String} the query string
         * @return  {Object} the parameters to encode
         */
      function decode(str) {
        var data = {};
        if (str === '') {
          return data;
        }
        var pairs = str.split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=', 2);
          var key = decodeURIComponent(pair[0]);
          if (data.hasOwnProperty(key)) {
            throw new URIError('Duplicate key: ' + key);
          }
          data[key] = pair.length === 2
            ? decodeURIComponent(pair[1])
            : null;
        }
        return data;
      }

      var QueryString = {
        encode: encode,
        decode: decode
      };
      module.exports = QueryString;
  });
  
  __d("copyProperties",[],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      /**
       * Merge two objects into the first object 
       */
      function copyProperties(obj, a, b, c, d, e, f) {
        obj = obj || {};
        var args = [a, b, c, d, e];
        var ii = 0, v;
        while (args[ii]) {
          v = args[ii++];
          for (var k in v) {
            obj[k] = v[k];
          }
          if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
              (typeof v.toString != 'undefined') && (obj.toString !== v.toString)) {
            obj.toString = v.toString;
          }
        }
        return obj;
      }
      module.exports = copyProperties;
  });
  
  __d("UserAgent",[],function(global,require,requireDynamic,requireLazy,module,exports) {

      var _populated = false;
      var _ie, _firefox, _opera, _webkit, _chrome;
      var _osx, _windows, _linux, _android;
      var _win64;
      var _iphone, _ipad, _native;
      var _mobile;
        
      function _populate() {
        if (_populated) {
          return;
        }
        _populated = true;
        
        var uas = navigator.userAgent;
        var agent = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))/.exec(uas);
        var os    = /(Mac OS X)|(Windows)|(Linux)/.exec(uas);

        _iphone = /\b(iPhone|iP[ao]d)/.exec(uas);
        _ipad = /\b(iP[ao]d)/.exec(uas);
        _android = /Android/i.exec(uas);
        _native = /FBAN\/\w+;/i.exec(uas);
        _mobile = /Mobile/i.exec(uas);
        _win64 = !!(/Win64/.exec(uas));
        if (agent) {
          _ie = agent[1] ? parseFloat(agent[1]) : NaN;
          
          if (_ie && document.documentMode) {
            _ie = document.documentMode;
          }
          _firefox = agent[2] ? parseFloat(agent[2]) : NaN;
          _opera   = agent[3] ? parseFloat(agent[3]) : NaN;
          _webkit  = agent[4] ? parseFloat(agent[4]) : NaN;
          if (_webkit) {
            agent = /(?:Chrome\/(\d+\.\d+))/.exec(uas);
            _chrome = agent && agent[1] ? parseFloat(agent[1]) : NaN;
          } else {
            _chrome = NaN;
          }
        } else {
          _ie = _firefox = _opera = _chrome = _webkit = NaN;
        }

        if (os) {
          if (os[1]) {
            
            
            
            
            
            var ver = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(uas);

            _osx = ver ? parseFloat(ver[1].replace('_', '.')) : true;
          } else {
            _osx = false;
          }
          _windows = !!os[2];
          _linux   = !!os[3];
        } else {
          _osx = _windows = _linux = false;
        }
      }

      var UserAgent = {

        ie: function() {
          return _populate() || _ie;
        },
        ie64: function() {
          return UserAgent.ie() && _win64;
        },
        firefox: function() {
          return _populate() || _firefox;
        },
        opera: function() {
          return _populate() || _opera;
        },        
        webkit: function() {
          return _populate() || _webkit;
        },        
        safari: function() {
          return UserAgent.webkit();
        },    
        chrome : function() {
          return _populate() || _chrome;
        },    
        windows: function() {
          return _populate() || _windows;
        },    
        osx: function() {
          return _populate() || _osx;
        },    
        linux: function() {
          return _populate() || _linux;
        },    
        iphone: function() {
          return _populate() || _iphone;
        },
        mobile: function() {
          return false;// TODO: hack to support desktop only and ignore mobile cases
          //return _populate() || (_iphone || _ipad || _android || _mobile);
        },
        nativeApp: function() {
          return _populate() || _native;
        },
        android: function() {
          return _populate() || _android;
        },
        ipad: function() {
          return _populate() || _ipad;
        }
      };

      module.exports = UserAgent;
  });
    
  __d("sdk.Runtime",[],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      /**
       * Get and Set variables during runtime 
       */
      
      var Initialized = false,
      AccessToken = '',
      LoginStatus = undefined,
      UserId = '',
      ClientId = '';
                        MainWindowUrl = '';
      var Runtime = {
        setInitialized: function(initialized_val) {
          Initialized = initialized_val;
        },
        getInitialized: function() {
          return Initialized;
        },
        setUserID: function(user_id) {
          UserId = user_id;
        },
        getUserID: function() {
          return UserId;
        },
        setClientID: function(client_id) {
          ClientId = client_id;
        },
        getClientID: function() {
          return ClientId;
        },
        setAccessToken: function(access_token) {
          AccessToken = access_token;
        },
        getAccessToken: function() {
          return AccessToken;
        },
        setLoginStatus: function(login_status) {
          LoginStatus = login_status;
        },
        getLoginStatus: function() {
          return LoginStatus;
        },
                                setMainWindowUrl: function(main_window_url) {
          MainWindowUrl = main_window_url;
        },
        getMainWindowUrl: function() {
          return MainWindowUrl;
        }
      };
      module.exports = Runtime;
  });
    
  __d("guid",[],function(global,require,requireDynamic,requireLazy,module,exports) {
      /**
       * Get a unique random string
       * @return a random string with prefix rw 
       */
      function guid() {
        return 'rw' + (Math.random() * (1 << 30)).toString(16).replace('.', '');
      }
      module.exports = guid;
  });
  
  __d("hasNamePropertyBug",["guid"],function(global,require,requireDynamic,requireLazy,module,exports) {

      var guid = require('guid');
      var hasBug;
      
      /**
       * Tests whether the name of frame can be set by frame.name or not 
       */

      function test() {
          var form = document.createElement("form"),
              input = form.appendChild(document.createElement("input"));
          input.name = guid();
          hasBug = input !== form.elements[input.name];
          form = input = null;
          return hasBug;
      }

      function hasNamePropertyBug() {
        return typeof hasBug === 'undefined'
          ? test()
          : hasBug;
      }

      module.exports = hasNamePropertyBug;
  });
  
  __d("Type",["copyProperties"],function(global,require,requireDynamic,requireLazy,module,exports) {
      var copyProperties = require('copyProperties');

      function Type() {}
      
      /**
       * Extend a function prototype with that in from
       * @param from{Function} The function that extends the prototype
       * @param prototype The base prototype
       * @return The function contructor
       */
      
      function extend(from, prototype) {
        var constructor = prototype && prototype.hasOwnProperty('constructor')
          ? prototype.constructor
          : function() {this.parent.apply(this, arguments);};
        if (from && from.prototype instanceof Type === false) {
          throw new Error('parent type does not inherit from Type');
        }
        from = from || Type;
        var F = new Function();
        F.prototype = from.prototype;
        constructor.prototype = new F();
        copyProperties(constructor.prototype, prototype);
        constructor.prototype.constructor = constructor;
        constructor.parent = from;
        constructor.prototype.parent = function() {
          this.parent = from.prototype.parent;
          from.apply(this, arguments);
        };
        // Allow the new type to call this.parentCall('method'/*, args*/);
        constructor.prototype.parentCall = function(method) {
          return from.prototype[method].apply(this,
            Array.prototype.slice.call(arguments, 1));
        };

        constructor.extend = function(prototype) {
          return extend(this, prototype);
        };
        return constructor;
      }

      copyProperties(Type, {
        extend: function(prototype) {
          return typeof prototype === 'function'
            ? extend.apply(null, arguments)
            : extend(null, prototype);
        }
      });
      
      module.exports = Type;
  });
  
  __d("ObservableMixin",[],function(global,require,requireDynamic,requireLazy,module,exports) {

      function ObservableMixin() {
        this.__observableEvents = {};
      }

      ObservableMixin.prototype = {
        /**
         * Call the functions attached to the specified event 
         * @param what{String} The event name
         */
        inform: function(what) { 
          var args = Array.prototype.slice.call(arguments, 1);
          var list = Array.prototype.slice.call(this.getSubscribers(what));
          for (var i = 0; i < list.length; i++) {
            if (list[i] === null) continue;
            if (__DEV__) {
              list[i].apply(this, args);
            }else {
              try { 
                list[i].apply(this, args);
              } catch(e) {
                setTimeout(function() {throw e;}, 0);
              }
            }
          }
          return this;
        },
        /**
         * Get all the subscribers attached to the specified event 
         * @param toWhat{String} The event name
         */
        getSubscribers: function(toWhat) {
          return this.__observableEvents[toWhat] || (this.__observableEvents[toWhat] = []);
        },
        
        /**
         * Clear all the subscribers attached to the specified event 
         * @param toWhat{String} The event name
         */
        clearSubscribers: function(toWhat) {
          if (toWhat) {
            this.__observableEvents[toWhat] = [];
          }
          return this;
        },
        /**
         * Clear all the subscribers for all observable events 
         */
        clearAllSubscribers: function() {
          this.__observableEvents = {};
          return this;
        },
        /**
         * Subscribe to an event
         * @param toWhat{String} The event name
         * @param withWhat{Function} The function to be invoked
         */
        subscribe: function(toWhat, withWhat) {
          var list = this.getSubscribers(toWhat);
          list.push(withWhat);
          return this;
        },
        /**
         * Unsubscribe to an event
         * @param toWhat{String} The event name
         * @param withWhat{Function} The function to be invoked
         */
        unsubscribe: function(toWhat, withWhat) {
          var list = this.getSubscribers(toWhat);
          for (var i = 0; i < list.length; i++) {
            if (list[i] === withWhat) {
              list.splice(i, 1);
              break;
            }
          }
          return this;
        }
      };
      module.exports = ObservableMixin;
  });
  
  __d("DOMEventListener",[],function(global,require,requireDynamic,requireLazy,module,exports) {
    
      var add, remove;
      
      /**
       * add: Register the specified listener on the Event Target
       * remove: Removes the event listener previously registered with EventTarget.addEventListener.
       * @param target The event target may be an Element in a document, 
       *               the Document itself, a Window, or any other object that supports events
       * @param name{String} The event type to listen for.
       * @param listener The object that receives a notification when an event of the specified type occurs. 
       *                This must be an object implementing the EventListener interface, or simply a JavaScript function.
       */
      if (window.addEventListener) {
        add = function(target, name, listener) {
          listener.wrapper = listener; 
          target.addEventListener(name, listener.wrapper, false);
        },
        remove = function(target, name, listener) {
          target.removeEventListener(name, listener.wrapper, false);
        }
      } else if (window.attachEvent) {
        add = function(target, name, listener) {
          listener.wrapper = listener;
          target.attachEvent('on' + name, listener.wrapper);
        },
        remove = function(target, name, listener) {
          target.detachEvent('on' + name, listener.wrapper);
        }
      }

      var DOMEventListener = {
        add: function(target, name, listener) {
          add(target, name, listener); 
          return {
            remove: function() {
              remove(target, name, listener);
              target = null;
            }
          };
        },
        remove: remove
      };
      module.exports = DOMEventListener;
  });

  __d("sdk.createIframe",["copyProperties","guid","hasNamePropertyBug","DOMEventListener"],function(global,require,requireDynamic,requireLazy,module,exports) {
      var copyProperties = require('copyProperties');
      var guid = require('guid');
      var DOMEventListener = require('DOMEventListener');
      var hasNamePropertyBug = require('hasNamePropertyBug');
      
      /**
       * Creates an iframe with the options provided
       * @param opts {Object} The iframe options like name, style, url, etc.
       * @return {Html} The iframe Html Object
       */
      
      function createIframe(opts) { 
        opts = copyProperties({}, opts);
        var frame;
        var name = opts.name || guid();
        var root = opts.root;
        var style = opts.style ||  {border: 'none'};
        var src = opts.url;
        var onLoad = opts.onload;
        if (hasNamePropertyBug()) {
          frame = document.createElement('<iframe name="' + name + '"/>');
        } else {
          frame = document.createElement("iframe");
          frame.name = name;
        }
        // delete attributes that we're setting directly
        delete opts.style;
        delete opts.name;
        delete opts.url;
        delete opts.root;
        delete opts.onload;
        var attributes =  copyProperties({
          frameBorder: 0,
          allowTransparency: true,
          scrolling: 'no'
        }, opts);
        if (attributes.width) {
          frame.width = attributes.width + 'px';
        }
        if (attributes.height) {
          frame.height = attributes.height + 'px';
        }
        delete attributes.height;
        delete attributes.width;
        for (var key in attributes) {
          if (attributes.hasOwnProperty(key)) {
            frame.setAttribute(key, attributes[key]);
          }
        }
        copyProperties(frame.style, style);
        frame.src = "javascript:false";
        root.appendChild(frame);
        if (onLoad) {
          var listener = DOMEventListener.add(frame, 'load', function() {
            listener.remove();
            onLoad();
          });
        }
        // "javascript:false" to work around the IE issue mentioned above)
        frame.src = src;
        return frame;
      }
      module.exports = createIframe;
  });
  
  __d("DOMWrapper",[],function(global,require,requireDynamic,requireLazy,module,exports) {
      var rootElement,
          windowRef;
      
      var DOMWrapper = {
        
        /**
         * Set the rootElement value to the given root
         */
        setRoot: function(root) {
          rootElement = root;
        },
        /**
         * Get the rootElement value
         * @return The above set value or the current document body
         */
        getRoot: function() {
          return rootElement || document.body;
        },
        /**
         * Set the windowRef value to the given win value
         */
        setWindow: function(win) {
          windowRef = win;
        },
        /**
         * Get the windowRef value 
         * @return The above set value or the current window
         */
        getWindow: function() {
          return windowRef || self;
        }
      };
      module.exports = DOMWrapper;
  });
  
  __d("emptyFunction",["copyProperties"],function(global,require,requireDynamic,requireLazy,module,exports) {

      var copyProperties = require('copyProperties');
      
      /**
       * Make an empty function 
       */

      function makeEmptyFunction(arg) {
        return function() {
          return arg;
        };
      }

      function emptyFunction() {}
      
      copyProperties(emptyFunction, {
        thatReturns: makeEmptyFunction,
        thatReturnsFalse: makeEmptyFunction(false),
        thatReturnsTrue: makeEmptyFunction(true),
        thatReturnsNull: makeEmptyFunction(null),
        thatReturnsThis: function() {return this;},
        thatReturnsArgument: function(arg) {return arg;},
        mustImplement: function(module, property) {
          return function() {
            if (__DEV__) {
              throw new Error(module + '.' + property + ' must be implemented!');
            }
          };
        }
      });

      module.exports = emptyFunction;

  });
  
  __d("sdk.Event",[],function(global,require,requireDynamic,requireLazy,module,exports) {

      var Event = {
        /**
          * Returns the internal subscriber array that can be directly 
          * manipulated by adding/removing things.
          * @access private
          * @return {Object}
          */
        subscribers: function(){
          /** this allow instances to have a map of their events. 
            */
          if (!Event._subscribersMap) {
            Event._subscribersMap = {};
          }
          return Event._subscribersMap;
        },
        /**
          * Subscribe to a given event name, invoking your callback function 
          * whenever the event is fired
          * @access public
          * @param name {String} Name of the event.
          * @param cb {Function} The handler function.
          */
        subscribe: function(name, cb) {
          var subs = Event.subscribers();
          if (!subs[name]) {
            subs[name] = [cb];
          } else {
            subs[name].push(cb);
          }
        },
        /**
          * Removes subscribers
          * @access public
          * @param name {String} Name of the event.
          * @param cb {Function} The handler function.
          */
        unsubscribe: function(name, cb) {
          var subs = Event.subscribers()[name];
          if (subs) {
            for(var key in subs) {
              if (subs[key] == cb) {
                subs[key] = null;
              }
            }
          }
        },
        /**
         * Removes all subscribers for named event.
         * This is useful if the event is no longer worth listening to and you
         * believe that multiple subscribers have been set up.
         * @access private
         * @param name    {String}   name of the event
         */
        clear: function(name) {
          delete Event.subscribers()[name];
        },
        /**
         * Fires a named event. 
         * @access private
         * @param name {String} the event name
         */
        fire: function(name) { 
          var args = Array.prototype.slice.call(arguments, 1),
              subs = Event.subscribers()[name];
          if (subs) { 
            for(var index in subs) { 
              var sub_fn = subs[index];
              if (sub_fn) {
                sub_fn.apply(this, args);
              }
            }
          }
        }
      };
      
    module.exports = Event;
  });
  
  __d("resolveURI",[],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      /**
       * Make a url. Remove all & and "" from the url
       * @return {String} The resolved url
       */
      
      function resolveURI(uri) {
        if (!uri) { 
          return window.location.href;
        }

        uri = uri.replace(/&/g, '&amp;') 
                 .replace(/"/g, '&quot;'); 

        var div = document.createElement('div');
        // This uses `innerHTML` because anything else doesn't resolve properly or
        div.innerHTML = '<a href="' + uri + '"></a>';

        return div.firstChild.href; 
      }
      module.exports = resolveURI;
  });
  
  __d("sdk.domReady",[],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      var queue;
      var domIsReady = "readyState" in document ? /loaded|complete/.test(document.readyState) : !!document.body;
      
      /**
       * Call all the functions in the queue and Flush the queue. It will be executed
       * after the DOM is ready.
       *
       * @param {Function} the function to invoke when ready
       */
      function flush() {
        if (!queue) {
          return;
        }
        var fn;
        while (fn = queue.shift()) {
          fn();
        }
        queue = null;
      }
      
      /**
       * Bind a function to be executed when the DOM is ready. It will be executed
       * immediately if the DOM is already ready.
       *
       * @param {Function} the function to invoke when ready
       */
      
      function domReady(fn) {
        if (queue) {
          queue.push(fn);
          return;
        } else {
          fn();
        }
      }
      // NOTE: This code is self-executing. This is necessary in order to correctly
      // determine the ready status.
      if(!domIsReady) { 
        queue = [];
        if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', flush, false);
          window.addEventListener('load', flush, false);
        } else if (document.attachEvent) {
          document.attachEvent('onreadystatechange', flush);
          window.attachEvent('onload', flush);
        }
         // If doScroll function exists and page is not in a frame, continuously check to see if
        // the document is ready
        if (document.documentElement.doScroll && window == window.top) {
          var test = function() {
            try {
              document.documentElement.doScroll('left');
            } catch(error) {
              setTimeout(test, 0);
              return;
            }
            flush();
          };
          // execute any waiting functions
          test();
        }
      }
      
      module.exports = domReady;
  },3);
  
  __d("sdk.DOM",[],function(global,require,requireDynamic,requireLazy,module,exports) {

      var cssRules = {};
      /**
       * Add CSS rules using a <style> tag.
       *
       * @param styles {String} the styles
       */
      function addCssRules(styles) {      
        var style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = styles;
        document.getElementsByTagName('head')[0].appendChild(style);
      }
      
      function removeCss(dom,className) {
                                if(typeof String.prototype.trim !== 'function') {
                                  String.prototype.trim = function() {
                                    return this.replace(/^\s+|\s+$/g, '');
                                  }
                                }
        var regExp = new RegExp('\\s*' + className, 'g');
        dom.className = dom['className'].replace(regExp, '').trim();
      }
      
      function containsCss(dom, className) {
        var cssClassWithSpace = ' ' + dom['className'] + ' ';
        var currentClassWithSpace = ' ' + className + ' ';
        return cssClassWithSpace.indexOf(currentClassWithSpace) >= 0;
      }
      
      function addCss(dom, className) {
        if (!containsCss(dom, className)) {
          dom.className = dom['className'] + ' ' + className;
        }
      }
      
      function getViewportInfo() {
        var root = (document.documentElement && document.compatMode == 'CSS1Compat')
          ? document.documentElement
          : document.body;
        return {
          scrollTop  : root.scrollTop || document.body.scrollTop,
          scrollLeft : root.scrollLeft || document.body.scrollLeft,
          width      : window.innerWidth  ? window.innerWidth  : root.clientWidth,
          height     : window.innerHeight ? window.innerHeight : root.clientHeight
        };
      }

      var DOM = {
        addCssRules: addCssRules,
        removeCss: removeCss,
        containsCss: containsCss,
        addCss: addCss,
        getViewportInfo: getViewportInfo
      };
      module.exports = DOM;
  });
  
  __d("sprintf",[],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      /**
       * Get the message to be displayed for Log 
       */
      
      function sprintf(str, argsdotdot) {
        argsdotdot = Array.prototype.slice.call(arguments, 1);
        var index = 0;
        return str.replace(/%s/g, function(match) {
          return argsdotdot[index++];
        });
      }
      module.exports = sprintf;
  });
  
  __d("Log",["sprintf"],function(global,require,requireDynamic,requireLazy,module,exports) {
                        
      var sprintf = require('sprintf');
      var Level = {
        DEBUG    : 3,
        INFO     : 2,
        WARNING  : 1,
        ERROR    : 0
      };
      
      /**
       * Logs all debugs, info, warnings, errors.
       * Used mostly during debugging 
       */
      
      function logfn(msg, level) {
                                var args = Array.prototype.slice.call(arguments, 2);
        var msg = sprintf.apply(null, args); 
        var console = window.console; 
        if (console && Log.level >= level) {
          console[name in console ? name : 'log'](msg);
        }
                        }
      
      var Log = {
        level: -1,
        Level: Level,
        debug : logfn.bind(null, 'debug', Level.DEBUG),
        info  : logfn.bind(null, 'info', Level.INFO),
        warn  : logfn.bind(null, 'warn', Level.WARNING),
        error : logfn.bind(null, 'error', Level.ERROR)
      };
      module.exports = Log;
  });
  
  __d("Base64",[],function(global,require,requireDynamic,requireLazy,module,exports) {
    
     /** Decode the signed request 
      */
      var en =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      function en3(c) {
        c = (c.charCodeAt(0) << 16) | (c.charCodeAt(1) << 8) | c.charCodeAt(2);
        return String.fromCharCode(
          en.charCodeAt(c >>> 18), en.charCodeAt((c >>> 12) & 63),
          en.charCodeAt((c >>> 6) & 63), en.charCodeAt(c & 63));
      }
      // Position 0 corresponds to '+' (ASCII 43), and underscores are padding.
      // The octal sequence \13 is used because IE doesn't recognize \v
      var de =
        '>___?456789:;<=_______' +
        '\0\1\2\3\4\5\6\7\b\t\n\13\f\r\16\17\20\21\22\23\24\25\26\27\30\31' +
        '______\32\33\34\35\36\37 !"#$%&\'()*+,-./0123';
      function de4(c) {
        c = (de.charCodeAt(c.charCodeAt(0) - 43) << 18) |
            (de.charCodeAt(c.charCodeAt(1) - 43) << 12) |
            (de.charCodeAt(c.charCodeAt(2) - 43) <<  6) |
             de.charCodeAt(c.charCodeAt(3) - 43);
        return String.fromCharCode(c >>> 16, (c >>> 8) & 255, c & 255);
      }
      var Base64 = {
        decode: function(s) {
          
          s = s.replace(/[^A-Za-z0-9+\/]/g, '');
          var i = (s.length + 3) & 3;
          s = (s + 'AAA'.slice(i)).replace(/..../g, de4);
          s = s.slice(0, s.length + i - 3);
          
          try {return decodeURIComponent(escape(s));}
          catch (_) {throw new Error('Not valid UTF-8');}
        },
        decodeObject: function(b64) {
          return JSON.parse(Base64.decode(b64));
        }
      };
      module.exports = Base64;
  });
  
  __d("sdk.SignedRequest",["Base64"],function(global,require,requireDynamic,requireLazy,module,exports) {
    
      var Base64 = require('Base64');
      
      /** Parse the encoded signed request 
       * @param signed_request{String} The signed token sent by server
       * @return {JSON} the decoded object
       */
      
      function parse(signed_request) {
        if (!signed_request) {
          return null;
        }
        var payload = signed_request.split('.', 2)[1]
          .replace(/\-/g, '+').replace(/\_/g, '/'); 
        return Base64.decodeObject(payload);
      }
      var SignedRequest = {
        parse: parse
      };
      module.exports = SignedRequest;
  });
  
  __d("sdk.Content",["sdk.domReady","Log"],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      var domReady = require('sdk.domReady');
      var Log = require('Log');
      
      var visibleRoot;
      var hiddenRoot;
      
      var Content = {
        /**
         * Append some content.
         *
         * @access private
         * @param content {String|Node} a DOM Node or HTML string
         * @param root    {Node}  (optional) a custom root node
         * @return {Node} the node that was just appended
         */
        append: function(content,root) {
          if (!root) {
            if (!visibleRoot) {
              // Check if div with id rw-root exists in the document
              // If not, make a div with id rw-root
              visibleRoot = root = document.getElementById('rw-root');
              if (!root) {
                Log.warn('The "rw login root" div has not been created, auto-creating');
                visibleRoot = root = document.createElement('div');
                
                root.id = 'rw-root';

                // that the body has loaded to avoid potential "operation aborted"
                if (!document.body) {
                  domReady(function() {
                    document.body.appendChild(root);
                  });
                } else {
                  document.body.appendChild(root);
                }
              }
              root.className += ' rw_reset';
            } else {
              root = visibleRoot;
            }
          }
          //----Position fixed incase of mobile------
                var w = window,
                    d = document,
                    e = d.documentElement,
                    g = d.getElementsByTagName('body')[0],
                    x = w.innerWidth || e.clientWidth || g.clientWidth,
                    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
                   
                if(1) {
                  //document.getElementById("rw-root").style.height = "100vh";
                }
                //-----------------------------------------
          if (typeof content == 'string') {
            var div = document.createElement('div');
            root.appendChild(div).innerHTML = content;
            return div;
          } else {
            return root.appendChild(content);
          }
        },
         /**
           * Append some hidden content.
           *
           * @access private
           * @param content {String|Node} a DOM Node or HTML string
           * @return {Node} the node that was just appended
           */
        appendHidden: function(content){
          if (!hiddenRoot) {
            var hiddenRoot = document.createElement('div'),
                style      = hiddenRoot.style;
                style.position = 'absolute';
                style.top      = '-10000px';
                style.width    = style.height = 0;
                hiddenRoot = Content.append(hiddenRoot);
          }

          return Content.append(content, hiddenRoot);
        },
        /**
         * Dynamically generate a <form> and POST it to the given target.
         *
         * The opts MUST contain:
         *   url     String  action URL for the form
         *   target  String  the target for the form
         *   params  Object  the key/values to be used as POST input
         *
         * @access protected
         * @param opts {Object} the options
         */
        submitToTarget: function(opts, get) {
          var form = document.createElement('form');
          form.action = opts.url;
          form.target = opts.target;
          form.method = (get) ? 'GET' : 'POST';
          Content.appendHidden(form);
          for (var key in opts.params) {
            if (opts.params.hasOwnProperty(key)) {
              var val = opts.params[key];
              if (val !== null && val !== undefined) {
                var input = document.createElement('input');
                input.name = key;
                input.value = val;
                form.appendChild(input);
              }
            }
          }
          form.submit();
          form.parentNode.removeChild(form);
        }
      };
      module.exports = Content;
  });
  
  __d("dotAccess",[],function(global,require,requireDynamic,requireLazy,module,exports) {

      function dotAccess(head, path, create) {
        var stack = path.split('.');
        do {
          var key = stack.shift();
          head = head[key] || create && (head[key] = {});
        } while(stack.length && head);
        return head;
      }
      module.exports = dotAccess;
  });
  
  __d("GlobalCallback",["DOMWrapper","dotAccess","guid"],function(global,require,requireDynamic,requireLazy,module,exports) {

      var DOMWrapper = require('DOMWrapper');
      var dotAccess = require('dotAccess');
      var guid = require('guid');

      // window is the same as the 'global' object in the browser, but the variable
      // 'global' might be shadowed.
      var rootObject;
      var callbackPrefix;

      var GlobalCallback = {
        setPrefix: function(prefix) {
          rootObject = dotAccess(DOMWrapper.getWindow(), prefix, true);
          callbackPrefix = prefix;
        },
        create: function(fn, description) {
          if (!rootObject) {
            this.setPrefix('__globalCallbacks');
          }
          var id = guid();
          rootObject[id] = fn;
          return callbackPrefix + '.' + id;
        },
        remove: function(name) {
          var id = name.substring(callbackPrefix.length + 1);
          delete rootObject[id];
        }
      };
      module.exports = GlobalCallback;

  });
  
  __d("XDM",["DOMEventListener","DOMWrapper","emptyFunction","guid","Log"],function(global,require,requireDynamic,requireLazy,module,exports) {

      var DOMEventListener = require('DOMEventListener');
      var DOMWrapper = require('DOMWrapper');
      var emptyFunction = require('emptyFunction');
      var guid = require('guid');
      var Log = require('Log');

      var transports = {};
      var configuration = {
        transports : []
      };
      var window = DOMWrapper.getWindow();
      
      /** Find the transport name in configuration.transports  
       * @return The name of the transport
       */

      function findTransport() {
        var list = configuration.transports;
        i = list.length;
        while (i--) {
          var name = list[i],
              transport = transports[name];
          if (transport.isAvailable()) {
            return name;
          }
        }
      }

      var XDM = {
        /** 
         * Register the cross domain communication provider in configuration.transports
         * @param name{String} The name of the provider
         * @param provider The provider functions
         */
        register: function(name, provider) {
          Log.debug('Registering %s as XDM provider -- %s'  , name, JSON.stringify(provider));
          configuration.transports.push(name);
          transports[name] = provider;
        },
        
        /** 
         * Create the cross domain communication channel
         * If the required configurations are missing, it includes default configurations  
         *  @param config{Object} The XDM configuration containing variables 
         *                        like channel name,channelPath ; functions like whenready, onmessage
         * @return The provider name
         */

        create: function(config) {
          Log.debug(Date.now() + "RW - " + " XDM.create - started" );
          if (!config.whenReady && !config.onMessage) {
            Log.error('An instance without whenReady or onMessage makes no sense');
            throw new Error('An instance without whenReady or ' +
                            'onMessage makes no sense');
          }
          if (!config.channel) {
            Log.warn('Missing channel name, selecting at random');
            config.channel = guid();
          }

          if (!config.whenReady) {
            config.whenReady = emptyFunction;
          }
          if (!config.onMessage) {
            config.onMessage = emptyFunction;
          }

          var name = config.transport || findTransport(),
              transport = transports[name];
          if (transport && transport.isAvailable()) { 
            Log.debug('%s is available', name);
            transport.init(config);
            return name;
          }
        }

      };
      
      /**
       * Provides Native `window.postMessage` based XD support.
       * @access private
       */

      XDM.register('postmessage', (function() {
        var inited = false;
        return {
          /**
           * Check if window.postmessage is available. 
           */
          isAvailable : function() {
            return !!window.postMessage;
          },
          /**
           * Initialize the native PostMessage system. 
           * Send function: To postmessage to another window
           * Adds Window Message Event Listener that will receive the incoming postmessage
           * @param config{Object} The XDM configuration containing variables 
           *                        like channel name,channelPath ; functions like whenready, onmessage
           */
          init: function(config) {
            Log.debug('init postMessage: ' + config.channel);
            var prefix = '_RW_' + config.channel;
            var xdm = {
              //Send message to another window
              send: function(message, origin, windowRef, channel) {
                if (window === windowRef) {
                  Log.error('Invalid windowref, equal to window (self)');
                  throw new Error();
                }
                Log.debug('sending to: %s (%s)', origin, channel);
                var send = function() {
                  Log.debug('RW - ' + ' internal message send - %s, %s', message, origin);
                  windowRef.postMessage('_RW_' + channel + message, origin);
                };
                send();
              }
            };
            if (inited) {
              Log.debug(' RW - postmessage.init - whenready calling');
              config.whenReady(xdm);
              return;
            }
            //Adds Window Message Event Listener that will receive the incoming postmessage
            DOMEventListener.add(window, 'message', (function(event) {
              var message = event.data;
              var origin = event.origin || 'native';
              if (typeof message != 'string') {
                Log.warn('Received message of type %s from %s, expected a string',
                  typeof message, origin);
                return;
              }
              if (message.substring(0, prefix.length) == prefix) {
                message = message.substring(prefix.length);
              }
              // Call the on message function which will invoke the callback function
              config.onMessage(message, origin);
            }));
            config.whenReady(xdm);
            inited = true;
          }
        };
      })());

      module.exports = XDM;

  });
  
  __d("sdk.XD",["sdk.Content","sdk.createIframe","sdk.Event","guid","Log","QueryString","resolveURI","sdk.Runtime","XDM"],function(global,require,requireDynamic,requireLazy,module,exports) {

        var Content = require('sdk.Content');
        var createIframe = require('sdk.createIframe');
        var Event = require('sdk.Event');
        var guid = require('guid');
        var Log = require('Log');
        var QueryString = require('QueryString');
        var resolveURI = require('resolveURI');
        var Runtime = require('sdk.Runtime');
        var XDM = require('XDM');

        var httpProxyFrame;
        var proxySecret = guid();
        var channel = guid();
        var origin = location.protocol + '//' + location.host;
        var xdm;
        var inited = false;
        var IFRAME_TITLE = 'Readwhere XDM Frame';
        
         /**
          * Handles a message event.
          * @access private
          * @param message {Message} the message object
          * @param origin {String} the sender of message
          */

        function onMessage(message,senderOrigin) {  
          if (typeof message == 'string') {
            
            if (message.substring(0, 1) == '{') {
              try {
                message = JSON.parse(message);
              } catch (decodeException) {
                Log.warn('Failed to decode %s as JSON', message);
                return;
              }
            } else {
              message = QueryString.decode(message);
            }
          }
          
          if (!senderOrigin) {
            if (message.xd_sig == proxySecret) {
              senderOrigin = message.xd_origin;
            }
          }

          if (message.cb) { 
            var cb = XD._callbacks[message.cb]; 
            if (!XD._forever[message.cb]) {
              delete XD._callbacks[message.cb];
            }
            if (cb) {  
              cb(message);
            }
          }
        }
        
        /**
         * Initialize the XD layer. PostMessage is required.
         * It is called after RW.init, when the init:post event is fired
         * It forms the cross domain iframe which will invoke the callback function
         * @access private
         */

        function init() { 
          if (inited) {
            return;
          }
          var channelPath = location.pathname + location.search;
          channelPath += '?rw_xd_fragment#xd_sig=' + proxySecret + '&';
          var container = Content.appendHidden(document.createElement('div'));
          var transport = XDM.create({
            root: container,
            channel: channel,
            channelPath: '/rwconnect/handler#',
            whenReady: function(instance) {
              xdm = instance;
              /** 
               * @param channelPath {String} The url of cross domain iframe
               * @param channel {String} A unique id for the cross domain iframe
               * @param origin {String} It is used for XD security. It needs to be based on
               *              document.domain rather than the URL of the current window. It is
               *              required and validated by Readwhere as part of the handler.php.
               */
              var proxyData = {
                channel: channel, 
                origin: location.protocol + '//' + location.host, 
                channel_path: channelPath
              };
              var proxyUrl = 'rwconnect/handler' +'#' + QueryString.encode(proxyData);
              var httpDomain = rwdomain;
              httpProxyFrame = createIframe({
                url: httpDomain + proxyUrl,
                name: 'rw_xdm_frame_http',
                id: 'rw_xdm_frame_http',
                root: container,
                'aria-hidden':true,
                title: IFRAME_TITLE,
                'tab-index': -1
              }); 
            },
            onMessage: onMessage
          });
          inited = true;
        }
        
        /**
          * The cross domain communication layer.
          * @access private
          */

        var XD = {
          _callbacks: {},
          _forever: {},
          onMessage: onMessage,
          init: init,
          /**
           * Builds a url attached to a callback for xd messages.
           *
           * This is one half of the XD layer. Given a callback function, we generate
           * a xd URL which will invoke the function. This allows us to generate
           * redirect urls (used for next/cancel and so on) which will invoke our
           * callback functions.
           *
           * @access private
           * @param cb       {Function} the callback function
           * @param relation {String}   parent or opener to indicate window relation
           * @param forever  {Boolean}  indicate this handler needs to live forever
           * @return        {String}   the xd url bound to the callback
           */
          handler: function(cb, relation, forever, id) {
            var handlerDomain = rwdomain;
            return handlerDomain + 'rwconnect/handler' + '#' + QueryString.encode({
              cb        : this.registerCallback(cb, forever, id),
              origin    : origin + '/' + channel,
              domain    : location.hostname
            });
          },
          
          /**
           * Handles the raw or parsed message and invokes the bound callback with
           * the data and removes the related window/frame.
           *
           * @access private
           * @param cb {Fucntion} the callback function
           * @param id {String} the callback function id
           * @param persistent  {Boolean} indicate this handler needs to live forever
           */

          registerCallback: function(cb, persistent, id) {
            id = id || guid();
            if (persistent) {
              XD._forever[id] = true;
            }
            XD._callbacks[id] = cb;
            return id;
          }
        };
        
        /** 
         * Subscribe to init:post which will give call to init function above
         */

        Event.subscribe('init:post', function(options) {
        	if (options.enable_google_one_tap && options.google_client_id) {
        	
    		var enc = getUserCookie('wl_rw-token');

          if (enc == "") {
        loadGoogleOneTap(options.google_client_id, function () {
          if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.initialize({
              client_id: options.google_client_id,
              callback: function (response) {
                handleGoogleCredential(response.credential);
              },
              auto_select: true,
              cancel_on_tap_outside: false
            });
            window.google.accounts.id.prompt();
          }
        });
      }
    
  }
          init();
        });

        module.exports = XD;

  });
  
  __d("sdk.Auth",["copyProperties","sdk.createIframe","DOMWrapper","guid","Log","ObservableMixin","QueryString","sdk.Runtime","sdk.SignedRequest","sdk.XD"],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      var copyProperties = require('copyProperties');
      var createIframe = require('sdk.createIframe');
      var DOMWrapper = require('DOMWrapper');
      var guid = require('guid');
      var Log = require('Log');
      var ObservableMixin = require('ObservableMixin');
      var QueryString = require('QueryString');
      var Runtime = require('sdk.Runtime');
      var SignedRequest = require('sdk.SignedRequest');
      var XD = require('sdk.XD');
      var currentAuthResponse,timer;
      var Auth = new ObservableMixin();
      
      /**
         * Set the authresponse that should be returned to the callback.
         * @access private
         * @param authResponse {Object} The response of getloginstatus given by the server.
         * @param status {Boolean} Force reloading the login status (default `false`).
         */
      
      function setAuthResponse(authResponse, status) { 
        var currentUserID = Runtime.getUserID();
        var userID = '';
        if (authResponse) {
          // get user id from authresponse or signed request
          if (authResponse.userID) { 
            userID = authResponse.userID;
          } else if (authResponse.signedRequest) {
            var parsedSignedRequest = SignedRequest.parse(authResponse.signedRequest);
            if (parsedSignedRequest && parsedSignedRequest.user_id) {
              userID = parsedSignedRequest.user_id;
            }
          }
        } 
        var currentStatus = Runtime.getLoginStatus();
        var login = (currentStatus === 'unknown' && authResponse);
        var logout = currentUserID && !authResponse;
        var both = authResponse && currentUserID && currentUserID != userID;
        var authResponseChange = authResponse != currentAuthResponse;
        var statusChange = status != (currentStatus || 'unknown'); 
        Runtime.setLoginStatus(status);
        Runtime.setAccessToken(authResponse && authResponse.accessToken || null);
        Runtime.setUserID(userID); 
        currentAuthResponse = authResponse; 
        var response = {
          authResponse : authResponse,
          status : status
        }; 
        if (logout || both) {
          Auth.inform('logout', response);
        }
        if (login || both) {
          Auth.inform('login', response);
        }
        if (authResponseChange) {
          Auth.inform('authresponse.change', response);
        }
        if (statusChange) {
          Auth.inform('status.change', response);
        }
        return response;
      }
      
      /**
         * Find out the current authresponse.
         * @access private
         * @return {Object}  the auth response
         */

      function getAuthResponse() {
        return currentAuthResponse;
      }
      
      /**
         * The response given by the server is handled by this function.
         * @access private
         * @param cb {Function} The callback function.
         * @param authResponse {Object} The current AuthResponse.
         * @param method {String} The current method for which handler is called.
         * @return {function} the function which will handle the server response and call the callback function.
         */

      function loginResponseWrapper(cb, authResponse, method) {
          return function (params) { 
            var status;
            if (params && params.signed_request) {
              var parsedSignedRequest = SignedRequest.parse(params.signed_request);
              authResponse = {
                accessToken: params.access_token,
                userID: parsedSignedRequest.user_id,
                expiresIn: parseInt(params.expires_in, 10),
                signedRequest: params.signed_request,
                email: params.email,
                crypt: params.crypt,
                username: params.username,
                firstname: params.firstname,
                lastname: params.lastname,
                keyForCrypt: params.key_for_crypt,
                sessionKey: params.session_key,
                isPublisher: params.isPublisher
              };
              status = 'connected';
              setAuthResponse(authResponse, status);
            } else if (method === 'oauth' || method === 'login_status') {
              if (params.error) {
                status = params.error;
              } else {
                status = 'unknown';
              }
              setAuthResponse(null, status);
            }
            if (cb) {
              cb({
                authResponse: Auth.getAuthResponse(),
                status: Runtime.getLoginStatus()
              });
            }
            return authResponse;
          }
        }
        
        /**
         * Fetch the login status from the server. 
         * Get the iframe url and create an iframe which will connect to the server.
         * @access private
         * @param fn {Function} The callback function.
         */

        function fetchLoginStatus(fn) {
          var frame;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }

          var enc = getCookie('wl_rw-token');

          if (enc == "") {
			RW.login(function(response) {});
          } else {
              var token_cookie = window.atob(enc);
              var myObj = JSON.parse(token_cookie);
              response = myObj;
           
              var handleResponse = loginResponseWrapper(fn, currentAuthResponse,'login_status'); 

              if (handleResponse(response)) {
                timer = setTimeout(function() {
                  fetchLoginStatus(function() {});
                }, 1200000); 
              }
          }  
          // Get the url for getting the login status from the server
          /*var url = rwdomain + 'rwconnect/checklogin?'+(QueryString.encode({
              client_id: Runtime.getClientID(),
              display: 'none',
              domain: location.hostname,
              redirect_uri: XD.handler(function(response) {
                frame.parentNode.removeChild(frame);
                if (handleResponse(response)) {
                  timer = setTimeout(function() {
                    fetchLoginStatus(function() {});
                  }, 1200000); 
                }
              })
          }));
          // Create an iframe for getting the login status from the server
          frame = createIframe({
            root: DOMWrapper.getRoot(),
            name: guid(),
            url: url.toString(),
            style: {display: 'none'}
          });*/
        }

        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                  c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                  return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        var loadState;
        /**
         * Find out the current login status from the server.
         * @access public
         * @param cb {Function} The callback function.
         * @param force {Boolean} Force reloading the login status (default `false`).
         */
        function getLoginStatus(cb, force) {
          // we either invoke the callback right away if the status has already been
          // loaded, or queue it up for when the load is done.
          if (cb) {
            if (!force && loadState == 'loaded') {
              cb({status: Runtime.getLoginStatus(),
                   authResponse: getAuthResponse()});
              return;
            } else {
              Auth.subscribe('RW.loginStatus', cb);
            }
          }
          // if we're already loading, and this is not a force load, we're done
          if (!force && loadState == 'loading') {
            return;
          }
          loadState = 'loading';
          // invoke the queued sessionLoad callbacks
          var lsCb = function(response) { 
            loadState = 'loaded';       
            // invoke callbacks  
            Auth.inform('RW.loginStatus', response);
            Auth.clearSubscribers('RW.loginStatus'); 
          };
          fetchLoginStatus(lsCb);
        }

        copyProperties(Auth, {
          getLoginStatus: getLoginStatus,
          fetchLoginStatus: fetchLoginStatus,
          setAuthResponse: setAuthResponse,
          getAuthResponse: getAuthResponse,
          parseSignedRequest: SignedRequest.parse,
          loginResponseWrapper: loginResponseWrapper
        });
        module.exports = Auth;
  });
  
  __d("sdk.Api",["copyProperties","sdk.createIframe","DOMWrapper","guid","Log","ObservableMixin","QueryString","sdk.Runtime","sdk.SignedRequest","sdk.XD"],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      var copyProperties = require('copyProperties');
      var createIframe = require('sdk.createIframe');
      var DOMWrapper = require('DOMWrapper');
      var guid = require('guid');
      var Log = require('Log');
      var ObservableMixin = require('ObservableMixin');
      var QueryString = require('QueryString');
      var Runtime = require('sdk.Runtime');
      var SignedRequest = require('sdk.SignedRequest');
      var XD = require('sdk.XD');
      var currentApiResponse,timer;
      var Api = new ObservableMixin();
      
      /**
         * Find out the current apiresponse.
         * @access private
         * @return {Object}  the auth response
         */

      function getApiResponse() {
        return currentApiResponse;
      }
      
      /**
         * The api response given by the server is handled by this function.
         * @access private
         * @param cb {Function} The callback function.
         * @param apiResponse {Object} The current ApiResponse.
         * @param method {String} The current api method for which handler is called.
         * @return {function} the function which will handle the server api response 
         * and call the callback function.
         */

      function apiResponseWrapper(cb, apiResponse, method) {
        return function (params) { 
          var status;
          if (params && params.user_id) {
            var parsedSignedRequest = SignedRequest.parse(params.api_response);
            status = 'successfull';
            currentApiResponse = {
              apiResponse: parsedSignedRequest,
              status: status
            };
          } else if (method === 'cart') {
            if (params.error && params.error === 'access_denied') {
              status = 'unknown_user';
            } else {
              status = 'unknown';
            }
            currentApiResponse = {
              apiResponse: null,
              status: status
            };
          }
          if (cb) {
            cb(currentApiResponse);
          }
          return apiResponse;
        }
      }
      
      /**
         * Fetch the api response from the server. 
         * Get the api iframe url and create an iframe which will connect to the server.
         * @access private
         * @param fn {Function} The callback function.
         * @param method {String} The api method name.
         */

      function fetchApiResponse(fn, method) {
        var frame;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        } 
        var handleApiResponse = apiResponseWrapper(fn, currentApiResponse,method); 
        var url = rwdomain + 'rwconnect/'+method+'?'+(QueryString.encode({
            client_id: Runtime.getClientID(),
            domain: location.hostname,
            redirect_uri: XD.handler(function(response) {
              frame.parentNode.removeChild(frame);
              if (handleApiResponse(response)) {
                timer = setTimeout(function() {
                  fetchApiResponse(function() {});
                }, 1200000); 
              }
            })
        }));

        frame = createIframe({
          root: DOMWrapper.getRoot(),
          name: guid(),
          url: url.toString(),
          style: {display: 'none'}
        });
      }
      
      /**
         * Get the api data from the server.
         * @access public
         * @param cb {Function} The callback function.
         * @param method {String} The api method name.
         */

      var loadState;
        
      function getApiData(cb,method) {
        var obs_name = 'RW.'+method+'api';
        if (cb) {
          if (loadState == 'loaded') {
            cb(getApiResponse());
            return;
          } else {
            Api.subscribe(obs_name, cb);
          }
        }
        // if we're already loading, and this is not a force load, we're done
        if (loadState == 'loading') {
          return;
        }
        loadState = 'loading';
        var lsCb = function(response) { 
          loadState = 'loaded';           
          Api.inform(obs_name, response);
          Api.clearSubscribers(obs_name); 
        };
        fetchApiResponse(lsCb,method);
      }

      copyProperties(Api, {
        getApiResponse: getApiResponse,
        fetchApiResponse: fetchApiResponse,
        getApiData: getApiData,
        apiResponseWrapper: apiResponseWrapper
      });
      module.exports = Api;
  });
  
  __d("RW",["copyProperties","CssConfig","sdk.domReady","sdk.DOM","sdk.Content","DOMWrapper","Log"],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      var copyProperties = require('copyProperties');
      var CssConfig = requireDynamic('CssConfig');
      var domReady = require('sdk.domReady');
      var DOM = require('sdk.DOM');
      var Content = require('sdk.Content');
      var DOMWrapper = require('DOMWrapper');
      var Log = require('Log');

      var externalInterface;
      var logged = {};
      externalInterface = window.RW = {};
      var RW = {};
      
      Log.level = 1;
      
      var rwRoot = document.createElement('div');
      DOMWrapper.setRoot(rwRoot);
      
      domReady(function() {
        Log.info('domReady');
        Content.appendHidden(rwRoot);
        if (CssConfig.rules) {
          DOM.addCssRules(CssConfig.rules);
        }
      });
      
      /**
       * Provides functions to window.RW which can be called directly
       * @param source An object containing a list of key name and functions
       */
      function provide(source) {
        for(var key in source) {
          var value = source[key]; 
          if (typeof value === 'function') {
            externalInterface[key] = value;
          }
        }
      }
      copyProperties(RW, {
        provide: provide
      });
      module.exports = RW;
  });
  
  __d("sdk.Dialog",["ObservableMixin","Type","UserAgent","sdk.Content","sdk.DOM"],function(global,require,requireDynamic,requireLazy,module,exports) {

    var ObservableMixin = require('ObservableMixin');
    var Type = require('Type');
    var UserAgent = require('UserAgent');
    var Content = require('sdk.Content');
    var DOM = require('sdk.DOM');
    
    /**
     * Form the SDKDialog function that extends ObservableMixin 
     */
    var SdkDialog = Type.extend({
      constructor: function SdkDialog(id,display) {
        this.parent();
        this.id = id;
        this.display = display;

        if (!Dialog._dialogs) {
          Dialog._dialogs = {};
        }
        Dialog._dialogs[id] = this;
      }
    }, ObservableMixin);

    var Dialog = {
      
      /** Create a new dialog instance 
       * @params id{String} The Dialog Id
       * @params display{String} The Dialog display method
       * @return The dialog instance created
       */
      newInstance: function(id, display) {
        return new SdkDialog(id, display);
      },
      
      _dialogs: null,
      _lastYOffset: 0,
      _loaderEl: null,
      _overlayEl: null,
      _stack: [],
      _active: null,
      
      /** Get the dialog instance by id
       * @params id{String} The Dialog Id
       * @return The dialog instance
       */
      get: function(id) {
        return Dialog._dialogs[id];
      },
      
      /** Get default dialog size
       * @return The dialog size containing height and width
       */
      
      getDefaultSize: function() {
        //return {width: 350, height: 500};
                    var iframe_width, iframe_height;
                    var w = window,
                        d = document,
                        e = d.documentElement,
                        g = d.getElementsByTagName('body')[0],
                        x = w.innerWidth || e.clientWidth || g.clientWidth,
                        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
                       
                    iframe_width = 315;
                    iframe_height = 545;
        return {
                  width: iframe_width,
                  height: iframe_height
                };
      },
      
      _findRoot: function(node) {
        while (node) {
          if (DOM.containsCss(node, 'rw_dialog')) {
            return node;
          }
          node = node.parentNode;
        }
      },


      /* translucent background code added here */
      _addTransBg: function() {
        var body = document.getElementsByTagName('body')[0];
        var root = document.getElementById('rw-root');
        if(root) {
          var transBg = document.createElement('div');
          body.className = 'scroller_hidden'; 
          transBg.className = 'login_trans_bg';
          transBg.setAttribute("id",'transBodyBg');
          root.appendChild(transBg);  

          var transBodyBgHeight = Math.max( 
                      document.body.scrollHeight, 
                      document.body.offsetHeight, 
                      document.documentElement.clientHeight, 
                      document.documentElement.scrollHeight, 
                      document.documentElement.offsetHeight 
                    );
          transBg.setAttribute("style",'height:'+transBodyBgHeight+'px');
          
        }
      },

      _removeTransBg: function() {
        var root = document.getElementById('rw-root');
        var transBg = document.getElementById('transBodyBg');
        if(root && transBg) {
          root.removeChild(transBg);
          root.style.height = "0vh";  
        }

        var root = document.getElementById('rw-root');
        var transBg = document.getElementById('transBodyBg');
        
        if(root && transBg) {
          root.removeChild(transBg);
          root.style.height = "0vh";  
        }

        var body = document.getElementsByTagName("body")[0];
        if(body) {
          DOM.removeCss(body, 'scroller_hidden');
        }
      },
      /* translucent background code ends here */

      _createWWWLoader: function(width) {
        width = width ? width : 460;
        var w = window,
          d = document,
          e = d.documentElement,
          g = d.getElementsByTagName('body')[0],
          x = w.innerWidth || e.clientWidth || g.clientWidth;
          y = w.innerHeight || e.clientHeight || g.clientHeight;
        
        var closeButton = '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" id="rw_dialog_loader_close" style="position: absolute;top: -8px;right: 0px;width:30px;height:30px;z-index: 100001;color: #FF512F;opacity: 9 !important;font-size: 21px !important; margin: 0px !important;border: none !important;background: none;"><img src="https://marketing.readwhere.com/rwconnect_close.png" style="height: 20px;width: 20px;"></button>';
        if(x <= 600) {
          closeButton =   '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" id="rw_dialog_loader_close" style="position: absolute;top: -2px;right: -3px;width:30px;height:30px;z-index: 100001;color: #FF512F;opacity: 9 !important;font-size: 21px !important; margin: 0px !important;border: none !important;background: none;"><img src="https://marketing.readwhere.com/rwconnect_close.png" style="height: 20px;width: 20px;"></button>';
        }
        return Dialog.create({
          content: (
          '<div class="">' + closeButton + '</div>' +
          '<div class="dialog_content" id="rw_iframe_container"><div id="iframe_loading_msg" style="position:absolute;left:45%;z-index:100000;top:50%"><img src="https://www.readwhere.com/img/wait.gif" /></div></div>' +
          '<div class="dialog_footer"></div>'),
          width: width
        });
      },

      _createMobileLoader: function() {
        var chrome = UserAgent.nativeApp()
          ? ''
          : ('<table>' +
            '  <tbody>' +
            '    <tr>' +
            '      <td class="header_left">' +
            '        <label class="touchable_button">' +
            '          <input type="submit" value="' +
                         Intl.tx._("Cancel") + '"' +
            '            id="rw_dialog_loader_close"/>' +
            '        </label>' +
            '      </td>' +
            '      <td class="header_center">' +
            '        <div>' + Intl.tx._("Loading...") + '</div>' +
            '      </td>' +
            '      <td class="header_right">' +
            '      </td>' +
            '    </tr>' +
            '  </tbody>' +
            '</table>');

        return Dialog.create({
          classes: 'loading' + (UserAgent.ipad() ? ' centered' : ''),
          content: (
            '<div class="dialog_header">' +
              chrome +
            '</div>')
        });
      },

      _restoreBodyPosition: function() {
        if (!UserAgent.ipad()) {
          var body = document.getElementsByTagName('body')[0];
          DOM.removeCss(body, 'fb_hidden');
        }
      },

      _showIPadOverlay: function() {
        if (!UserAgent.ipad()) {
          return;
        }
        if (!Dialog._overlayEl) {
          Dialog._overlayEl = document.createElement('div');
          Dialog._overlayEl.setAttribute('id', 'rw_dialog_ipad_overlay');
          Content.append(Dialog._overlayEl, null);
        }
        Dialog._overlayEl.className = '';
      },

      _hideIPadOverlay: function() {
        if (UserAgent.ipad()) {
          Dialog._overlayEl.className = 'hidden';
        }
      },
      
      _hideLoader: function() { 
        if (Dialog._loaderEl && Dialog._loaderEl == Dialog._active) {
          Dialog._loaderEl.style.top = '-10000px';
        }
      },

      _makeActive: function(el) {
        Dialog._setDialogSizes();
        Dialog._lowerActive();
        Dialog._active = el;
        Dialog._centerActive();
      },

      _lowerActive: function() {
        if (!Dialog._active) {
          return;
        }
        Dialog._active.style.top = '-10000px';
        Dialog._active = null;
      },
      
      _centerActive: function(pageInfo) { 
        var dialog = Dialog._active;
        if (!dialog) {
          return;
        } 
        var view = DOM.getViewportInfo(); 
        var width = parseInt(dialog.offsetWidth, 10);
        var height = parseInt(dialog.offsetHeight, 10);
        var left = view.scrollLeft + (view.width - width) / 2;
        // these ensure that the dialog is always within the iframe's 
        var minTop = (view.height - height) / 2.5;
        if (left < minTop) {
          minTop = left;
        }
        var maxTop = view.height - height - minTop;
        var top = (view.height - height) / 2;
        if (pageInfo) {
          top = pageInfo.scrollTop - pageInfo.offsetTop +
            (pageInfo.clientHeight - height) / 2;
        }
        if (top < minTop) {
          top = minTop;
        } else if (top > maxTop) {
          top = maxTop;
        }
        // offset by the iframe's scroll
        top += view.scrollTop;
        if (UserAgent.mobile()) {     
          var paddingHeight = 100;
          if (UserAgent.ipad()) {
            paddingHeight += (view.height - height) / 2;
          } else {
            var body = document.getElementsByTagName('body')[0];
            DOM.addCss(body, 'fb_hidden');
            left = 10000;
            top = 10000;
          }
          var paddingDivs = DOM.getByClass('rw_dialog_padding', dialog);
          if (paddingDivs.length) {
            paddingDivs[0].style.height = paddingHeight + 'px';
          }
        }
        dialog.style.left = (left > 0 ? left : 0) + 'px';
       // dialog.style.top = (top > 0 ? top-130 : 0) + 'px';
       var scrheight = Math.max( 
                      document.body.scrollTop, 
                      document.documentElement.scrollTop
                    );
       var dialogFromTop = +scrheight + +60;
       dialog.style.top = dialogFromTop+'px';
       var w = window,
          d = document,
          e = d.documentElement,
          g = d.getElementsByTagName('body')[0],
          x = w.innerWidth || e.clientWidth || g.clientWidth;
          y = w.innerHeight || e.clientHeight || g.clientHeight;
          
        //alert("  x  =  " + x + " y = " + y);
         var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        // alert("ios = "+iOS);
        if(x <= 600 || y<450) {

          dialog.style.top = scrheight + 10 +'px';
          dialog.style.overflow = 'auto';
        }
        document.getElementById("rw-root").style.height = "100vh";
        var custom_height = y-20;
        if(y >= 545) {
          dialog.style.height = '535px';
        }else if(iOS){
          dialog.style.height = '535px';
        }else{
          dialog.style.height = custom_height+'px';
        }
       
      },

      _setDialogSizes: function() {
        if (!UserAgent.mobile() || UserAgent.ipad()) {
          return;
        }
        for (var id in Dialog._dialogs) {
          if (Dialog._dialogs.hasOwnProperty(id)) {
            var iframe = document.getElementById(id);
            if (iframe) {
              iframe.style.width = Dialog.getDefaultSize().width + 'px';
              iframe.style.height = Dialog.getDefaultSize().height + 'px';
            }
          }
        }
      },
    
      /** Create a dialog
       * @param opts{Object} The options for forming the dialog
       * @return The DOM Element created
       */
      
      create: function(opts) { 
        opts = opts || {};
        var
          dialog ,
          contentRoot = document.createElement('div'),
          className   = 'rw_dialog';
                             /*   if(opts.dialog) {
                                  dialog = opts.dialog;
                                } else { */
                                  dialog = document.createElement('div')
                              //  }
        if (opts.closeIcon && opts.onClose) {
          var closeIcon = document.createElement('a');
          closeIcon.className = 'rw_dialog_close_icon';
          closeIcon.onclick = opts.onClose;
          dialog.appendChild(closeIcon);
        }

        className += ' ' + (opts.classes || '');
        
        if (UserAgent.ie()) {
          className += ' rw_dialog_legacy';
          var dialog_names = [ 'vert_left','vert_right','horiz_top','horiz_bottom','top_left','top_right','bottom_left','bottom_right']
          for(var index in dialog_names) {
            var span = document.createElement('span');
            span.className = 'rw_dialog_' + dialog_names[index];
            dialog.appendChild(span);
          }
        } else {
          className += UserAgent.mobile() ? ' rw_dialog_mobile' : ' rw_dialog_advanced';
        }

        if (opts.content) {
          Content.append(opts.content, contentRoot);
        }
        dialog.className = className;
        var width = parseInt(opts.width, 10);
        if (!isNaN(width)) {
          dialog.style.width = width + 'px';
        }
        contentRoot.className = 'rw_dialog_content';

        dialog.appendChild(contentRoot);
        if (UserAgent.mobile()) {
          var padding = document.createElement('div');
          padding.className = 'rw_dialog_padding';
          dialog.appendChild(padding);
        }
        if(opts.dialogRoot) {
          Content.append(dialog, opts.dialogRoot);
          DOM.addCss(dialog, 'rw_iframe');
        } else {
          Content.append(dialog);
        }
       /*
        if (opts.visible) { 
          Dialog.show(dialog);
        } */
                          
        return contentRoot;
      },
      
      /** Show a loader for the dialog
       * @param cb{Function} The callback function
       * @param width{number} The width of loader
       */
      showLoader: function(cb,width) {
        Dialog._showIPadOverlay();
        if (!Dialog._loaderEl) { 
          Dialog._loaderEl = Dialog._findRoot(UserAgent.mobile()
            ? Dialog._createMobileLoader()
            : Dialog._createWWWLoader(width));
        }
        
        if (!cb) {
          cb = function() {};
        }
        var loaderClose = document.getElementById('rw_dialog_loader_close');
        DOM.removeCss(loaderClose, 'fb_hidden');
        loaderClose.onclick = function() {
          /* translucent background remove function called from here */
          Dialog._removeTransBg();
          Dialog._hideLoader();
          Dialog._restoreBodyPosition();
          Dialog._hideIPadOverlay();
          cb();
        };
        var iPadOverlay = document.getElementById('rw_dialog_ipad_overlay');
        if (iPadOverlay) {
          iPadOverlay.ontouchstart = loaderClose.onclick;
        }
   
        Dialog._makeActive(Dialog._loaderEl);
      },
      
      remove: function(dialog) {
        dialog = Dialog._findRoot(dialog); 
        if (dialog) {
          var is_active = Dialog._active == dialog;
          if (is_active) { 
            Dialog._hideLoader();
            if (Dialog._stack.length > 0) {
              Dialog.show(Dialog._stack.pop());
            } else {
              Dialog._lowerActive();
              Dialog._restoreBodyPosition();
              Dialog._hideIPadOverlay();
            }
          } 
          setTimeout(function() {
            dialog.parentNode.removeChild(dialog);
          }, 3000);
        }
      }
    };
    module.exports = Dialog;
  });
  
  __d("insertIframe",["guid","GlobalCallback"],function(global,require,requireDynamic,requireLazy,module,exports) {

      var guid = require('guid');
      var GlobalCallback = require('GlobalCallback');

      function insertIframe(opts) {
        opts.id = opts.id || guid();
        opts.name = opts.name || guid();
        var srcSet = false;
        var onloadDone = false;
        var callback = function() {
          if (srcSet && !onloadDone) {
            onloadDone = true;
            opts.onload && opts.onload(opts.root.firstChild);
          }
        };
        var globalCallback = GlobalCallback.create(callback);
        if (document.attachEvent) {
          var html = (
            '<iframe' +
              ' id="' + opts.id + '"' +
              ' name="' + opts.name + '"' +
              (opts.title ? ' title="' + opts.title + '"' : '') +
              (opts.className ? ' class="' + opts.className + '"' : '') +
              ' style="border:none;' +
              (opts.width ? 'width:' + opts.width + 'px;' : '') +
              (opts.height ? 'height:' + opts.height + 'px;' : '') +
              '"' +
              ' src="javascript:false;"' +
              ' frameborder="0"' +
              ' scrolling="no"' +
              ' allowtransparency="true"' +
              ' onload="' + globalCallback + '()"' +
              '></iframe>'
          );
          opts.root.innerHTML = (
            '<iframe src="javascript:false"' +
              ' frameborder="0"' +
              ' scrolling="no"' +
              ' style="height:1px"></iframe>'
          );
          srcSet = true;
          setTimeout(function() {
            opts.root.innerHTML = html;
            opts.root.firstChild.src = opts.url;
            opts.onInsert && opts.onInsert(opts.root.firstChild);
          }, 0);
        } else { 
          // This block works for all non-IE browsers, but it's specifically designed
          var node = document.createElement('iframe');
          node.id = opts.id;
          node.name = opts.name;
          node.onload = callback;
          node.scrolling = 'no';
          node.style.border = 'none';
          //node.style.overflow = 'hidden';
          if (opts.title) {
            node.title = opts.title;
          }
          if (opts.className) {
            node.className = opts.className;
          }
          if (opts.height !== undefined) {
            node.style.height = opts.height + 'px';
          }
          if (opts.width !== undefined) {
            if (opts.width == '100%') {
              node.style.width = opts.width;
            } else {
              node.style.width = opts.width + 'px';
            }
          }

          
          opts.root.appendChild(node);
                                        srcSet = true;
                                        
          node.src = opts.url;
          opts.onInsert && opts.onInsert(node);
          node.onload = function(){
            document.getElementById('iframe_loading_msg').style.display = 'none';
          };
                                        
        }
      }
      module.exports = insertIframe;
  });
  
  __d("sdk.UIServer",["sdk.Auth","sdk.Content","copyProperties","sdk.Dialog","guid","Log","QueryString","resolveURI","sdk.Runtime","sdk.XD","sdk.DOM","insertIframe"],function(global,require,requireDynamic,requireLazy,module,exports) {

        var Auth = require('sdk.Auth');
        var copyProperties = require('copyProperties');
        var Dialog = require('sdk.Dialog');
        var guid = require('guid');
        var Log = require('Log');
        var QueryString = require('QueryString');
        var resolveURI = require('resolveURI');
        var Runtime = require('sdk.Runtime');
        var XD = require('sdk.XD');
        var DOM = require('sdk.DOM');
        var insertIframe = require('insertIframe');
                                var Content = require('sdk.Content');
        
        /** List of all methods 
        */

        var Methods = {
          
          /** The login oauth method 
          */

          'dologin': {
            url       : 'rwconnect/loginv3',
            size      : {width: 400,
                          height: 450},
            transform : function(call) {
              // if we already have a session and permissions are not being requested,
              // we just fire the callback
              if (Auth.getAuthResponse()) {
                Log.error('RW.login() called when user is already connected.');
                call.cb && call.cb({status: Runtime.getLoginStatus(),
                                     authResponse: Auth.getAuthResponse()});
                return;
              }
              var cb = call.cb,
                id = call.id;
              delete call.cb;
             
              copyProperties(
                call.params, {
                  redirect_uri : resolveURI(
                    UIServer.xdHandler(
                      cb,
                      id,
                      'opener',
                      Auth.getAuthResponse(),
                      'oauth')),
                  response_type: 'token,signed_request',
                  domain: location.hostname
                                                                        
                                                                        
                });

              return call;
            }
          },
          'oauth': {
            transform : function(call) {
              call.closeIcon = false;
              // if we already have a session and permissions are not being requested,
              // we just fire the callback
              if (Auth.getAuthResponse()) {
                Log.error('RW.login() called when user is already connected.');
                call.cb && call.cb({status: Runtime.getLoginStatus(),
                                     authResponse: Auth.getAuthResponse()});
                return;
              }
              var cb = call.cb,
                id = call.id;
              delete call.cb;
                                                        
              copyProperties(
                call.params, {
                  redirect_uri : resolveURI(
                    UIServer.xdHandler(
                      cb,
                      id,
                      'opener',
                      Auth.getAuthResponse(),
                      'oauth')),
                  response_type: 'token,signed_request',
                  domain: location.hostname
                });

              return call;
            }
          }
        };
        
        /**
         * UI Methods will be defined in this namespace.
         */

        var UIServer = {
          
          Methods: Methods,
          
          _loadedNodes   : {},
          _defaultCb     : {},
          
           /**
             * Prepares a generic UI call.
             * @access private
             * @param params {Object} the user supplied parameters
             * @param cb {Function} the response callback
             * @returns {Object} the call data
             */
          
          prepareCall: function(params, cb) {
            var name   = params.method.toLowerCase(),
              method = copyProperties({}, UIServer.Methods[name]),
              id     = guid();
              copyProperties(params, {
                client_id       : Runtime.getClientID(),
                rwconnect_version : 'V3',
                access_token : Runtime.getAccessToken() || undefined,
                                                                main_window_url : Runtime.getMainWindowUrl()
              });
            // set the default dialog URL if one doesn't exist
            if (!method.url) {
              method.url = 'rwconnect/loginv3';
            }
            // the basic call data
            var call = {
              cb     : cb,
              id     : id,
              size   : method.size || Dialog.getDefaultSize(),
              url    : rwdomain + method.url,
              params : params,
              name   : name,
              dialog : Dialog.newInstance(id, params.display)
            };

            var transform = method.transform
            // optional method transform
            if (transform) {
              call = transform(call);
              // nothing returned from a transform means we abort
              if (!call) {
                return;
              }
            }
            var relation = UIServer.getXdRelation(call.params);
            if (!(call.id in UIServer._defaultCb) &&
                !('next' in call.params) &&
                !('redirect_uri' in call.params)) {
              call.params.next = UIServer._xdResult(
                call.cb,
                call.id,
                relation,
                true 
              );
            }

            call = UIServer.prepareParams(call);

            return call;
          },
          
          /**
             * Prepares the final url based on the call params.
             * @access private
             * @param call {Object} the call data
             * @returns {Object} the final call data
             */

          prepareParams: function(call) {
            var method = call.params.method;
            
            if (call.params.display !== 'async') {
              delete call.params.method;
            }
            // set this at the end to include all possible params
            var encodedQS = QueryString.encode(call.params);
            
            if (encodedQS) {
              call.url += '?' + encodedQS;
            }
            return call;
          },
          
          /**
           * Get the relation value
           * @access private
           */
          
          getXdRelation: function(params) {
            var display = params.display;
            if (display === 'popup' || display === 'touch') {
              return 'opener';
            }
            if (display === 'dialog' || display === 'iframe' || display === 'hidden' || display === 'none') {
              return 'parent';
            }
            if (display === 'async') {
              return 'parent.frames[' + window.name + ']';
            }
          },
          
          /**
           * Open a popup window with the given url and dimensions and place it at the
           * center of the current window.
           *
           * @access private
           * @param call {Object} the call data
           */

          popup: function(call) {
            var _screenX   = typeof window.screenX      != 'undefined' ? window.screenX : window.screenLeft,
                screenY    = typeof window.screenY      != 'undefined' ? window.screenY : window.screenTop,
                outerWidth = typeof window.outerWidth   != 'undefined' ? window.outerWidth : document.documentElement.clientWidth,
                outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight: (document.documentElement.clientHeight - 22),
                width    = call.size.width,
                height   = call.size.height,
                screenX  = (_screenX < 0) ? window.screen.width + _screenX : _screenX,
                left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
                top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
                features = [];

            if (width !== null) {
              features.push('width=' + width);
            }
            if (height !== null) {
              features.push('height=' + height);
            }
            features.push('left=' + left);
            features.push('top=' + top);
            features.push('scrollbars=1');
            if (call.name == 'permissions.request' || call.name == 'permissions.oauth') {
              features.push('location=1,toolbar=0');
            }
            features = features.join(',');
            var popup;
            popup = window.open(call.url, call.id, features);
            if (popup) { 
              UIServer.setLoadedNode(call, popup, 'popup');
            }
            if (!popup) {
              return;
            }
            // if there's a default close action, setup the monitor for it
            if (call.id in UIServer._defaultCb) {
              UIServer._popupMonitor();
            }
          },

                                        hidden: function(call) {
                                          call.className = 'FB_UI_Hidden';
                                          call.root = Content.appendHidden('');
                                          UIServer._insertIframe(call);
                                        },

          
          iframe: function(call) { 
            call.className = 'FB_UI_Dialog';
            var onClose = function() {
              UIServer._triggerDefault(call.id);
            };
                                                if (!call.hideLoader) {
              Dialog.showLoader(onClose, call.size.width);
            }
                                                var dialogRoot = document.getElementById('rw_iframe_container');
                                                var w = window,
                                                    d = document,
                                                    e = d.documentElement,
                                                    g = d.getElementsByTagName('body')[0],
                                                    x = w.innerWidth || e.clientWidth || g.clientWidth;
                                                    
                                                if(x <= 600) {
                                                 // dialogRoot.style.height = '387px';
                                                }
                                                
            call.root = Dialog.create({
              onClose: onClose,
              closeIcon: call.closeIcon === undefined ? true : call.closeIcon,
                                                        dialogRoot:dialogRoot
            });
            /* Translucent background called from here */
            Dialog._addTransBg();               
                                                
            DOM.addCss(call.root, 'rw_dialog_iframe');
            UIServer._insertIframe(call);
                                                
                                                
          },
          
          _insertIframe: function(call) {
            UIServer._loadedNodes[call.id] = false;
            var activate = function(node) {
              if (call.id in UIServer._loadedNodes) {
                UIServer.setLoadedNode(call, node, 'iframe');
              }
            };
                                                
            if (call.post) {
              insertIframe({
                url       : 'about:blank',
                root      : call.root,
                className : call.className,
                width     : call.size.width,
                height    : call.size.height,
                id        : call.id,
                onInsert  : activate,
                onload    : function(node) {
                  Content.submitToTarget({
                    url    : call.url,
                    target : node.name,
                    params : call.params
                  });
                }
              });
            } else {
              insertIframe({
                url       : call.url,
                root      : call.root,
                className : call.className,
                width     : call.size.width,
                height    : call.size.height,
                id        : call.id,
                name      : call.frameName,
                onInsert  : activate
              });
            }
          },
          
          /**
             * Sets the current loaded frame in the UIServer 
             * global variable _loadedNodes variable
             * to access the frame later.
             * @access private
             * @param call {Object} the call data
             * @param node {Object} The reference to your window.
             * @param type {Object} The display type.
             */

          setLoadedNode: function(call, node, type) {
            if (call.params && call.params.display != 'popup') {
              // you can't set a property on an https popup window in IE.
              node.rwCallID = call.id;
            }
            node = {
              node: node,
              type: type,
              rwCallID: call.id
            };
            UIServer._loadedNodes[call.id] = node;
          },
          
          /**
             * Get the current loaded frame in the UIServer 
             * global variable _loadedNodes variable
             * to access the frame later.
             * @access private
             * @param call {Object} the call data
             * @returns node {Object} The loaded node data.
             */

          getLoadedNode: function(call) { 
            var id = typeof call == 'object' ? call.id : call,
                node = UIServer._loadedNodes[id];
            return node ? node.node : null;
          },
          
           /**
             * Trigger the default action for the given call id.
             * @param id {String} the call id
             */

          _triggerDefault: function(id) {
            UIServer._xdRecv(
              {frame: id},
              UIServer._defaultCb[id] || function() {}
            );
          },
          
           /**
             * Start and manage the window monitor interval. This allows us to invoke
             * the default callback for a window when the user closes the window
             * directly.
             * @access private
             */
          _popupMonitor: function() {
            
            var found;
            for (var id in UIServer._loadedNodes) {
              
              if (UIServer._loadedNodes.hasOwnProperty(id) &&
                  id in UIServer._defaultCb) {
                var node = UIServer._loadedNodes[id];
                if (node.type != 'popup' && node.type != 'native') {
                  continue;
                }
                var win = node.node;

                try {
                  if (win.closed) {
                    UIServer._triggerDefault(id);
                  } else {
                    found = true; 
                  }
                } catch (y) {
                  
                }
              }
            }

            if (found && !UIServer._popupInterval) {
              // start the monitor if needed and it's not already running
              UIServer._popupInterval = setInterval(UIServer._popupMonitor, 100);
            } else if (!found && UIServer._popupInterval) {
              // shutdown if we have nothing to monitor but it's running
              clearInterval(UIServer._popupInterval);
              UIServer._popupInterval = null;
            }
          },
          
          /**
           * A "next handler" is a specialized XD handler that will also close the frame.
           *
           * @access private
           * @param cb        {Function} the callback function
           * @param frame     {String}   frame id for the callback will be used with
           * @param relation  {String}   parent or opener to indicate window relation
           * @param isDefault {Boolean}  is this the default callback for the frame
           * @return         {String}    the xd url bound to the callback
           */

          _xdNextHandler: function(cb,frame,relation,isDefault) {
            if (isDefault) {
              UIServer._defaultCb[frame] = cb;
            }
            return XD.handler(function(data) {
              UIServer._xdRecv(data, cb);
            }, relation) + '&frame=' + frame;
          },
          
          /**
           * Handles the parsed message, invokes the bound callback with the data and
           * removes the related window/frame. This is the asynchronous entry point for
           * when a message arrives.
           *
           * @access private
           * @param data {Object} the message parameters
           * @param cb {Function} the callback function
           */

          _xdRecv: function(data, cb) { 
            var frame = UIServer.getLoadedNode(data.frame);
            try {
                if (DOM.containsCss(frame, 'FB_UI_Hidden')) {
                  
                  // async flash crap. seriously, don't ever ask me about it.
                  setTimeout(function() {
                    frame.parentNode.parentNode.removeChild(frame.parentNode);
                  }, 3000);
                } else if (DOM.containsCss(frame, 'FB_UI_Dialog')) {
                  Dialog.remove(frame);
                }
              } catch (x) {
                
              }
            if (frame) {
               // popup window
              try {
                if (frame.close) { 
                  frame.close();
                  UIServer._popupCount--;
                }
              } catch (y) {
                
              }
            }
            // cleanup and fire the callback function
            delete UIServer._loadedNodes[data.frame];
            delete UIServer._defaultCb[data.frame];
            var dialog = Dialog.get(data.frame);
            cb(data);
          },
          
           /**
           * XD handler for the frame
           * @access private
           * @param cb        {Function} the callback function
           * @param frame     {String}   the frame id for the callback is tied to
           * @param target    {String}   parent or opener to indicate window relation
           * @param authResponse {Object}  the current auth response
           * @param method {String}  the method name to be used
           * @return          {String}   the xd url bound to the callback
           */

          xdHandler: function(cb, frame, target, authResponse, method) { 
            return UIServer._xdNextHandler(
              Auth.loginResponseWrapper(cb, authResponse, method),
              frame,
              target,
              true);
          },
          
          _xdResult: function(cb, frame, target, isDefault) {
            return (
              UIServer._xdNextHandler(function(params) {
                cb && cb(params.result &&
                         params.result != UIServer._resultToken &&
                         JSON.parse(params.result));
              }, frame, target, isDefault) +
              '&result=' + encodeURIComponent(UIServer._resultToken)
            );
          }
        };
        module.exports = UIServer;

  });
  
  __d("sdk.ui",["copyProperties","Log","sdk.UIServer"],function(global,require,requireDynamic,requireLazy,module,exports) {

      var copyProperties = require('copyProperties');
      var Log = require('Log');
      var UIServer = require('sdk.UIServer');
      
      /**
       * Method for triggering UI interaction with Readwhere as 
       * iframe dialogs or popups.
       * @access public
       * @param params {Object} The required arguments vary based on the method
       * being used, but specifying the method itself is mandatory. If *display* is
       * not specified, then iframe dialogs will be used when possible, and popups
       * otherwise.
       *
       * Property | Type    | Description                        | Argument
       * -------- | ------- | ---------------------------------- | ------------
       * method   | String  | The UI dialog to invoke.           | **Required**
       * display  | String  | Specify `"popup"` to force popups. | **Optional**
       * @param cb {Function} Optional callback function to handle the result.
       */

      function ui(params, cb) {
        params = copyProperties({}, params);
        if (!params.method) {
          Log.error('"method" is a required parameter for RW.ui().');
          return null;
        }
        var method = params.method;

        if (params.redirect_uri) {
          Log.warn('When using RW.ui, you should not specify a redirect_uri.');
          delete params.redirect_uri;
        }

        var call = UIServer.prepareCall(params, cb || function() {}); 
        if (!call) { 
          return null;
        }
        // each allowed "display" value maps to a function
        var displayName = call.params.display;
        if (displayName === 'dialog') {                          
          displayName = 'iframe';
        } else if (displayName === 'none') {
          displayName = 'hidden';
        }
        
        var displayFn = UIServer[displayName];
        if (!displayFn) {
          Log.error('"display" must be one of "popup", ' +
                 '"dialog", "iframe", "touch", "async", "hidden", or "none"');
          return null;
        }
        displayFn(call);
        return call.dialog;
      }

      module.exports = ui;

  });
  
  __d("rw.auth",["sdk.Auth","copyProperties","sdk.Event","RW","Log","sdk.ui"],function(global,require,requireDynamic,requireLazy) {
      var Auth = require('sdk.Auth');
      var copyProperties = require('copyProperties');
      var Event = require('sdk.Event');
      var RW = require('RW');
      var Log = require('Log');
      var ui = require('sdk.ui');

                        RW.provide({
        /** 
          * Get Current Login Status
          * @access public
          */
        getLoginStatus: function() { 
          return Auth.getLoginStatus.apply(Auth, arguments);
        },
        /** 
          * Get Current Auth Response
          * @access public
          */
        getAuthResponse: function() { 
          return Auth.getAuthResponse();
        },
        /** 
          * Login into Readwhere 
          * @access public
          * @param cb {Function} The callback function.
          * @param opts {Object} (_optional_) Options to modify login behavior.
          */
        login: function(cb,opts) {
          if (opts && opts.perms && !opts.scope) {
            opts.scope = opts.perms;
            delete opts.perms;
            Log.warn('OAuth2 specification states that \'perms\' ' +
                   'should now be called \'scope\'.  Please update.');
          }
          ui(copyProperties({
              method: 'oauth',
              display: 'iframe',
              domain: location.hostname
            }, opts || {}),
          cb);
        },
        /** 
          * Logout the user from Readwhere and website
          * @access public
          * @param cb {Function} The callback function.
          */
        logout: function(cb) { 
          ui({method: 'auth.logout', display: 'hidden'}, cb);
        }
      
        }); 
      /**
       * Fired when a logout action is performed.
       *  @event auth.logout
       */
      Auth.subscribe('logout', Event.fire.bind(true,Event, 'auth.logout'));
      /**
       * Fired when a login action is performed.
       * @event auth.login
       */
      Auth.subscribe('login', Event.fire.bind(true,Event, 'auth.login'));
      /**
       * Fired when the authresponse changes. 
       * This includes a login or logout action.
       * @event auth.statusChange
       */
      Auth.subscribe('authresponse.change', Event.fire.bind(true,Event, 'auth.authResponseChange'));
      /**
       * Fired when the status changes.
       * @event auth.statusChange
       */
      Auth.subscribe('status.change', Event.fire.bind(true,Event, 'auth.statusChange'));
  },3);
  
  __d("rw.api",["sdk.Api","RW"],function(global,require,requireDynamic,requireLazy) {
      var Api = require('sdk.Api');
      var RW = require('RW');
      
      RW.provide({
        getCart: function(cb) {
          return Api.getApiData(cb,'cart');
        }
      }); 
  },3);
  
  __d("rw.init",["RW","copyProperties","sdk.Event","Log","QueryString","sdk.Runtime"],function(global,require,requireDynamic,requireLazy,module,exports) {
      
      var RW = require('RW');
      var copyProperties = require('copyProperties');
      var Event = require('sdk.Event');
      var Log = require('Log');
      var QueryString = require('QueryString');
      var Runtime = require('sdk.Runtime');
      
      function init(options) { 
        /* Check if init has been called before */
        if (Runtime.getInitialized()) {
          Log.warn('RW.init has already been called - this could indicate a problem');
        }
        /* Check the type of object passed to init */
        if (/number|string/.test(typeof options)) {
          Log.warn('RW.init called with invalid parameters');
          options = {apiKey: options};
        }
        // Merge defaults with options 
        options = (options) ? options : {};
        options = copyProperties({"logging":true},options);
        var appId = options.appId || options.apiKey;
        if (/number|string/.test(typeof appId)) {
          Runtime.setClientID(appId.toString());
        }
        Runtime.setMainWindowUrl(window.location);
        Runtime.setInitialized(true);
        Event.fire('init:post', options);
      }
      
      /** this is useful when the library is being loaded asynchronously
        * we do it in a setTimeout to wait until the current event loop as finished.
        * this allows potential library code being included below this block
        */
      setTimeout(function() {     
        var pattern = /(login).*?#(.*)/;
        var scripts = document.getElementsByTagName('script');
        for(var index in scripts) { 
          var script = scripts[index];
          if (script.src) { 
            var match = pattern.exec(script.src); 
            if (match) {
              var opts = QueryString.decode(match[2]);
              for (var key in opts) {
                if (opts.hasOwnProperty(key)) {
                  var val = opts[key];
                  if (val == '0') {
                    opts[key] = 0;
                  }
                }
              }
              init(opts);
            }
          }
        }
        /** ### Asynchronous Loading
         * The library makes non-blocking loading of the script easy to use by
         * providing the `rwAsyncInit` hook. If this global function is defined, it
         * will be executed when the library is loaded:
         */
        if (window.rwAsyncInit && !window.rwAsyncInit.hasRun) {
          window.rwAsyncInit.hasRun = true;
          try {
            return window.rwAsyncInit.apply(window.rwAsyncInit, arguments);
          } catch(e) {
            window.setTimeout(function() {
              throw e;
            }, 0);
            return false;
          }
        }
      }, 0);
      module.exports = init;
      RW.provide({
        init: init
      });
  },3);
  void(0);
  }).call({}, window.inDapIF ? parent.window : window);
} catch(e) {
  
}
