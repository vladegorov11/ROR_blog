/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;

(function() {
  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(this);

  var Rails = this.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.0.3
Copyright © 2017 Basecamp, LLC
 */

(function(){(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(e,r){return t.controller.visit(e,r)},clearCache:function(){return t.controller.clearCache()}}}).call(this)}).call(this);var t=this.Turbolinks;(function(){(function(){var e,r,n=[].slice;t.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},t.closest=function(t,r){return e.call(t,r)},e=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),t.defer=function(t){return setTimeout(t,1)},t.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},t.dispatch=function(t,e){var r,n,o,i,s;return i=null!=e?e:{},s=i.target,r=i.cancelable,n=i.data,o=document.createEvent("Events"),o.initEvent(t,!0,r===!0),o.data=null!=n?n:{},(null!=s?s:document).dispatchEvent(o),o},t.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),t.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){t.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.absoluteURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=e(this.requestCanceled,this),this.requestTimedOut=e(this.requestTimedOut,this),this.requestFailed=e(this.requestFailed,this),this.requestLoaded=e(this.requestLoaded,this),this.requestProgressed=e(this.requestProgressed,this),this.url=t.Location.wrap(n).requestURL,this.referrer=t.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return t.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return t.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ProgressBar=function(){function t(){this.trickle=e(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,t.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",t.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},t.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},t.prototype.setValue=function(t){return this.value=t,this.refresh()},t.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},t.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},t.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},t.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},t.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},t.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},t.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},t.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},t.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},t.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=e(this.showProgressBar,this),this.progressBar=new t.ProgressBar}var n,o,i,s;return s=t.HttpRequest,n=s.NETWORK_FAILURE,i=s.TIMEOUT_FAILURE,o=500,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case i:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,o)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.History=function(){function r(t){this.delegate=t,this.onPageLoad=e(this.onPageLoad,this),this.onPopState=e(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(e,r){return e=t.Location.wrap(e),this.update("push",e,r)},r.prototype.replace=function(e,r){return e=t.Location.wrap(e),this.update("replace",e,r)},r.prototype.onPopState=function(e){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=e.state)?n.turbolinks:void 0)?(r=t.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(e){return t.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){t.Snapshot=function(){function e(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return e.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},e.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},e.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},e.prototype.clone=function(){return new e({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},e.prototype.getRootLocation=function(){var e,r;return r=null!=(e=this.getSetting("root"))?e:"/",new t.Location(r)},e.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},e.prototype.hasAnchor=function(t){try{return null!=this.body.querySelector("[id='"+t+"']")}catch(e){}},e.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},e.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},e.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},e}()}.call(this),function(){var e=[].slice;t.Renderer=function(){function t(){}var r;return t.render=function(){var t,r,n,o;return n=arguments[0],r=arguments[1],t=3<=arguments.length?e.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,t,function(){}),o.delegate=n,o.render(r),o},t.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},t.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},t.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},t}()}.call(this),function(){t.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.SnapshotRenderer=function(r){function n(e,r){this.currentSnapshot=e,this.newSnapshot=r,this.currentHeadDetails=new t.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new t.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return e(n,r),n.prototype.render=function(t){return this.trackedElementsAreIdentical()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},n.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},n.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},n.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},n.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},n.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},n.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},n.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},n.prototype.assignNewBody=function(){return document.body=this.newBody},n.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},n.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},n.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},n.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},n.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},n.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},n.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},n.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},n.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},n}(t.Renderer)}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.ErrorRenderer=function(t){function r(t){this.html=t}return e(r,t),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(t.Renderer)}.call(this),function(){t.View=function(){function e(t){this.delegate=t,this.element=document.documentElement}return e.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},e.prototype.getSnapshot=function(){return t.Snapshot.fromElement(this.element)},e.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,e):this.renderError(r,e)},e.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},e.prototype.renderSnapshot=function(e,r){return t.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),t.Snapshot.wrap(e))},e.prototype.renderError=function(e,r){return t.ErrorRenderer.render(this.delegate,r,e)},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=e(this.onScroll,this),this.onScroll=t.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){t.SnapshotCache=function(){function e(t){this.size=t,this.keys=[],this.snapshots={}}var r;return e.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},e.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},e.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},e.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},e.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},e.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},e.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(e){return t.Location.wrap(e).toCacheKey()},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=e(this.performScroll,this),this.identifier=t.uuid(),this.location=t.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new t.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(e,r){return this.response=e,null!=r&&(this.redirectedToLocation=t.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return t.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Controller=function(){function r(){this.clickBubbled=e(this.clickBubbled,this),this.clickCaptured=e(this.clickCaptured,this),this.pageLoaded=e(this.pageLoaded,this),this.history=new t.History(this),this.view=new t.View(this),this.scrollManager=new t.ScrollManager(this),this.restorationData={},this.clearCache()}return r.prototype.start=function(){return t.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new t.SnapshotCache(10)},r.prototype.visit=function(e,r){var n,o;return null==r&&(r={}),e=t.Location.wrap(e),this.applicationAllowsVisitingLocation(e)?this.locationIsVisitable(e)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(e,n)):window.location=e:void 0},r.prototype.startVisitToLocationWithAction=function(e,r,n){var o;return t.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(e,r,{restorationData:o})):window.location=e},r.prototype.startHistory=function(){return this.location=t.Location.wrap(window.location),this.restorationIdentifier=t.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(e,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(e,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=t.Location.wrap(e)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},r.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=document.getElementById(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(e,r){return t.dispatch("turbolinks:click",{target:e,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(e){return t.dispatch("turbolinks:before-visit",{data:{url:e.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(e){return t.dispatch("turbolinks:visit",{data:{url:e.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return t.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(e){
return t.dispatch("turbolinks:before-render",{data:{newBody:e}})},r.prototype.notifyApplicationAfterRender=function(){return t.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(e){return null==e&&(e={}),t.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:e}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(e,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new t.Visit(this,e,r),u.restorationIdentifier=null!=a?a:t.uuid(),u.restorationData=t.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(e){return this.nodeIsVisitable(e)?t.closest(e,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(e){var r;return r=new t.Location(e.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(e){var r;return(r=t.closest(e,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){var e,r,n;t.start=function(){return r()?(null==t.controller&&(t.controller=e()),t.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=t),n()},e=function(){var e;return e=new t.Controller,e.adapter=new t.BrowserAdapter(e),e},n=function(){return window.Turbolinks===t},n()&&t.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd&&define(t)}).call(this);
/*
Trix 0.10.2
Copyright © 2017 Basecamp, LLC
http://trix-editor.org/
 */

(function(){}).call(this),function(){var t;null==window.Set&&(window.Set=t=function(){function t(){this.clear()}return t.prototype.clear=function(){return this.values=[]},t.prototype.has=function(t){return-1!==this.values.indexOf(t)},t.prototype.add=function(t){return this.has(t)||this.values.push(t),this},t.prototype["delete"]=function(t){var e;return-1===(e=this.values.indexOf(t))?!1:(this.values.splice(e,1),!0)},t.prototype.forEach=function(){var t;return(t=this.values).forEach.apply(t,arguments)},t}())}.call(this),function(t){function e(){}function n(t,e){return function(){t.apply(e,arguments)}}function o(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],c(t,this)}function i(t,e){for(;3===t._state;)t=t._value;return 0===t._state?void t._deferreds.push(e):(t._handled=!0,void h(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._state?r:s)(e.promise,t._value);var o;try{o=n(t._value)}catch(i){return void s(e.promise,i)}r(e.promise,o)}))}function r(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var i=e.then;if(e instanceof o)return t._state=3,t._value=e,void a(t);if("function"==typeof i)return void c(n(i,e),t)}t._state=1,t._value=e,a(t)}catch(r){s(t,r)}}function s(t,e){t._state=2,t._value=e,a(t)}function a(t){2===t._state&&0===t._deferreds.length&&setTimeout(function(){t._handled||p(t._value)},1);for(var e=0,n=t._deferreds.length;n>e;e++)i(t,t._deferreds[e]);t._deferreds=null}function u(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function c(t,e){var n=!1;try{t(function(t){n||(n=!0,r(e,t))},function(t){n||(n=!0,s(e,t))})}catch(o){if(n)return;n=!0,s(e,o)}}var l=setTimeout,h="function"==typeof setImmediate&&setImmediate||function(t){l(t,1)},p=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)};o.prototype["catch"]=function(t){return this.then(null,t)},o.prototype.then=function(t,n){var r=new o(e);return i(this,new u(t,n,r)),r},o.all=function(t){var e=Array.prototype.slice.call(t);return new o(function(t,n){function o(r,s){try{if(s&&("object"==typeof s||"function"==typeof s)){var a=s.then;if("function"==typeof a)return void a.call(s,function(t){o(r,t)},n)}e[r]=s,0===--i&&t(e)}catch(u){n(u)}}if(0===e.length)return t([]);for(var i=e.length,r=0;r<e.length;r++)o(r,e[r])})},o.resolve=function(t){return t&&"object"==typeof t&&t.constructor===o?t:new o(function(e){e(t)})},o.reject=function(t){return new o(function(e,n){n(t)})},o.race=function(t){return new o(function(e,n){for(var o=0,i=t.length;i>o;o++)t[o].then(e,n)})},o._setImmediateFn=function(t){h=t},o._setUnhandledRejectionFn=function(t){p=t},"undefined"!=typeof module&&module.exports?module.exports=o:t.Promise||(t.Promise=o)}(this),/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
"undefined"==typeof WeakMap&&!function(){var t=Object.defineProperty,e=Date.now()%1e9,n=function(){this.name="__st"+(1e9*Math.random()>>>0)+(e++ +"__")};n.prototype={set:function(e,n){var o=e[this.name];return o&&o[0]===e?o[1]=n:t(e,this.name,{value:[e,n],writable:!0}),this},get:function(t){var e;return(e=t[this.name])&&e[0]===t?e[1]:void 0},"delete":function(t){var e=t[this.name];return e&&e[0]===t?(e[0]=e[1]=void 0,!0):!1},has:function(t){var e=t[this.name];return e?e[0]===t:!1}},window.WeakMap=n}(),function(t){function e(t){A.push(t),b||(b=!0,g(o))}function n(t){return window.ShadowDOMPolyfill&&window.ShadowDOMPolyfill.wrapIfNeeded(t)||t}function o(){b=!1;var t=A;A=[],t.sort(function(t,e){return t.uid_-e.uid_});var e=!1;t.forEach(function(t){var n=t.takeRecords();i(t),n.length&&(t.callback_(n,t),e=!0)}),e&&o()}function i(t){t.nodes_.forEach(function(e){var n=m.get(e);n&&n.forEach(function(e){e.observer===t&&e.removeTransientObservers()})})}function r(t,e){for(var n=t;n;n=n.parentNode){var o=m.get(n);if(o)for(var i=0;i<o.length;i++){var r=o[i],s=r.options;if(n===t||s.subtree){var a=e(s);a&&r.enqueue(a)}}}}function s(t){this.callback_=t,this.nodes_=[],this.records_=[],this.uid_=++C}function a(t,e){this.type=t,this.target=e,this.addedNodes=[],this.removedNodes=[],this.previousSibling=null,this.nextSibling=null,this.attributeName=null,this.attributeNamespace=null,this.oldValue=null}function u(t){var e=new a(t.type,t.target);return e.addedNodes=t.addedNodes.slice(),e.removedNodes=t.removedNodes.slice(),e.previousSibling=t.previousSibling,e.nextSibling=t.nextSibling,e.attributeName=t.attributeName,e.attributeNamespace=t.attributeNamespace,e.oldValue=t.oldValue,e}function c(t,e){return w=new a(t,e)}function l(t){return x?x:(x=u(w),x.oldValue=t,x)}function h(){w=x=void 0}function p(t){return t===x||t===w}function d(t,e){return t===e?t:x&&p(t)?x:null}function f(t,e,n){this.observer=t,this.target=e,this.options=n,this.transientObservedNodes=[]}if(!t.JsMutationObserver){var g,m=new WeakMap;if(/Trident|Edge/.test(navigator.userAgent))g=setTimeout;else if(window.setImmediate)g=window.setImmediate;else{var y=[],v=String(Math.random());window.addEventListener("message",function(t){if(t.data===v){var e=y;y=[],e.forEach(function(t){t()})}}),g=function(t){y.push(t),window.postMessage(v,"*")}}var b=!1,A=[],C=0;s.prototype={observe:function(t,e){if(t=n(t),!e.childList&&!e.attributes&&!e.characterData||e.attributeOldValue&&!e.attributes||e.attributeFilter&&e.attributeFilter.length&&!e.attributes||e.characterDataOldValue&&!e.characterData)throw new SyntaxError;var o=m.get(t);o||m.set(t,o=[]);for(var i,r=0;r<o.length;r++)if(o[r].observer===this){i=o[r],i.removeListeners(),i.options=e;break}i||(i=new f(this,t,e),o.push(i),this.nodes_.push(t)),i.addListeners()},disconnect:function(){this.nodes_.forEach(function(t){for(var e=m.get(t),n=0;n<e.length;n++){var o=e[n];if(o.observer===this){o.removeListeners(),e.splice(n,1);break}}},this),this.records_=[]},takeRecords:function(){var t=this.records_;return this.records_=[],t}};var w,x;f.prototype={enqueue:function(t){var n=this.observer.records_,o=n.length;if(n.length>0){var i=n[o-1],r=d(i,t);if(r)return void(n[o-1]=r)}else e(this.observer);n[o]=t},addListeners:function(){this.addListeners_(this.target)},addListeners_:function(t){var e=this.options;e.attributes&&t.addEventListener("DOMAttrModified",this,!0),e.characterData&&t.addEventListener("DOMCharacterDataModified",this,!0),e.childList&&t.addEventListener("DOMNodeInserted",this,!0),(e.childList||e.subtree)&&t.addEventListener("DOMNodeRemoved",this,!0)},removeListeners:function(){this.removeListeners_(this.target)},removeListeners_:function(t){var e=this.options;e.attributes&&t.removeEventListener("DOMAttrModified",this,!0),e.characterData&&t.removeEventListener("DOMCharacterDataModified",this,!0),e.childList&&t.removeEventListener("DOMNodeInserted",this,!0),(e.childList||e.subtree)&&t.removeEventListener("DOMNodeRemoved",this,!0)},addTransientObserver:function(t){if(t!==this.target){this.addListeners_(t),this.transientObservedNodes.push(t);var e=m.get(t);e||m.set(t,e=[]),e.push(this)}},removeTransientObservers:function(){var t=this.transientObservedNodes;this.transientObservedNodes=[],t.forEach(function(t){this.removeListeners_(t);for(var e=m.get(t),n=0;n<e.length;n++)if(e[n]===this){e.splice(n,1);break}},this)},handleEvent:function(t){switch(t.stopImmediatePropagation(),t.type){case"DOMAttrModified":var e=t.attrName,n=t.relatedNode.namespaceURI,o=t.target,i=new c("attributes",o);i.attributeName=e,i.attributeNamespace=n;var s=t.attrChange===MutationEvent.ADDITION?null:t.prevValue;r(o,function(t){return!t.attributes||t.attributeFilter&&t.attributeFilter.length&&-1===t.attributeFilter.indexOf(e)&&-1===t.attributeFilter.indexOf(n)?void 0:t.attributeOldValue?l(s):i});break;case"DOMCharacterDataModified":var o=t.target,i=c("characterData",o),s=t.prevValue;r(o,function(t){return t.characterData?t.characterDataOldValue?l(s):i:void 0});break;case"DOMNodeRemoved":this.addTransientObserver(t.target);case"DOMNodeInserted":var a,u,p=t.target;"DOMNodeInserted"===t.type?(a=[p],u=[]):(a=[],u=[p]);var d=p.previousSibling,f=p.nextSibling,i=c("childList",t.target.parentNode);i.addedNodes=a,i.removedNodes=u,i.previousSibling=d,i.nextSibling=f,r(t.relatedNode,function(t){return t.childList?i:void 0})}h()}},t.JsMutationObserver=s,t.MutationObserver||(t.MutationObserver=s,s._isPolyfilled=!0)}}(self),function(){"use strict";if(!window.performance){var t=Date.now();window.performance={now:function(){return Date.now()-t}}}window.requestAnimationFrame||(window.requestAnimationFrame=function(){var t=window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;return t?function(e){return t(function(){e(performance.now())})}:function(t){return window.setTimeout(t,1e3/60)}}()),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(){return window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||function(t){clearTimeout(t)}}());var e=function(){var t=document.createEvent("Event");return t.initEvent("foo",!0,!0),t.preventDefault(),t.defaultPrevented}();if(!e){var n=Event.prototype.preventDefault;Event.prototype.preventDefault=function(){this.cancelable&&(n.call(this),Object.defineProperty(this,"defaultPrevented",{get:function(){return!0},configurable:!0}))}}var o=/Trident/.test(navigator.userAgent);if((!window.CustomEvent||o&&"function"!=typeof window.CustomEvent)&&(window.CustomEvent=function(t,e){e=e||{};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,Boolean(e.bubbles),Boolean(e.cancelable),e.detail),n},window.CustomEvent.prototype=window.Event.prototype),!window.Event||o&&"function"!=typeof window.Event){var i=window.Event;window.Event=function(t,e){e=e||{};var n=document.createEvent("Event");return n.initEvent(t,Boolean(e.bubbles),Boolean(e.cancelable)),n},window.Event.prototype=i.prototype}}(window.WebComponents),window.CustomElements=window.CustomElements||{flags:{}},function(t){var e=t.flags,n=[],o=function(t){n.push(t)},i=function(){n.forEach(function(e){e(t)})};t.addModule=o,t.initializeModules=i,t.hasNative=Boolean(document.registerElement),t.isIE=/Trident/.test(navigator.userAgent),t.useNative=!e.register&&t.hasNative&&!window.ShadowDOMPolyfill&&(!window.HTMLImports||window.HTMLImports.useNative)}(window.CustomElements),window.CustomElements.addModule(function(t){function e(t,e){n(t,function(t){return e(t)?!0:void o(t,e)}),o(t,e)}function n(t,e,o){var i=t.firstElementChild;if(!i)for(i=t.firstChild;i&&i.nodeType!==Node.ELEMENT_NODE;)i=i.nextSibling;for(;i;)e(i,o)!==!0&&n(i,e,o),i=i.nextElementSibling;return null}function o(t,n){for(var o=t.shadowRoot;o;)e(o,n),o=o.olderShadowRoot}function i(t,e){r(t,e,[])}function r(t,e,n){if(t=window.wrap(t),!(n.indexOf(t)>=0)){n.push(t);for(var o,i=t.querySelectorAll("link[rel="+s+"]"),a=0,u=i.length;u>a&&(o=i[a]);a++)o.import&&r(o.import,e,n);e(t)}}var s=window.HTMLImports?window.HTMLImports.IMPORT_LINK_TYPE:"none";t.forDocumentTree=i,t.forSubtree=e}),window.CustomElements.addModule(function(t){function e(t,e){return n(t,e)||o(t,e)}function n(e,n){return t.upgrade(e,n)?!0:void(n&&s(e))}function o(t,e){b(t,function(t){return n(t,e)?!0:void 0})}function i(t){x.push(t),w||(w=!0,setTimeout(r))}function r(){w=!1;for(var t,e=x,n=0,o=e.length;o>n&&(t=e[n]);n++)t();x=[]}function s(t){C?i(function(){a(t)}):a(t)}function a(t){t.__upgraded__&&!t.__attached&&(t.__attached=!0,t.attachedCallback&&t.attachedCallback())}function u(t){c(t),b(t,function(t){c(t)})}function c(t){C?i(function(){l(t)}):l(t)}function l(t){t.__upgraded__&&t.__attached&&(t.__attached=!1,t.detachedCallback&&t.detachedCallback())}function h(t){for(var e=t,n=window.wrap(document);e;){if(e==n)return!0;e=e.parentNode||e.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&e.host}}function p(t){if(t.shadowRoot&&!t.shadowRoot.__watched){v.dom&&console.log("watching shadow-root for: ",t.localName);for(var e=t.shadowRoot;e;)g(e),e=e.olderShadowRoot}}function d(t,n){if(v.dom){var o=n[0];if(o&&"childList"===o.type&&o.addedNodes&&o.addedNodes){for(var i=o.addedNodes[0];i&&i!==document&&!i.host;)i=i.parentNode;var r=i&&(i.URL||i._URL||i.host&&i.host.localName)||"";r=r.split("/?").shift().split("/").pop()}console.group("mutations (%d) [%s]",n.length,r||"")}var s=h(t);n.forEach(function(t){"childList"===t.type&&(E(t.addedNodes,function(t){t.localName&&e(t,s)}),E(t.removedNodes,function(t){t.localName&&u(t)}))}),v.dom&&console.groupEnd()}function f(t){for(t=window.wrap(t),t||(t=window.wrap(document));t.parentNode;)t=t.parentNode;var e=t.__observer;e&&(d(t,e.takeRecords()),r())}function g(t){if(!t.__observer){var e=new MutationObserver(d.bind(this,t));e.observe(t,{childList:!0,subtree:!0}),t.__observer=e}}function m(t){t=window.wrap(t),v.dom&&console.group("upgradeDocument: ",t.baseURI.split("/").pop());var n=t===window.wrap(document);e(t,n),g(t),v.dom&&console.groupEnd()}function y(t){A(t,m)}var v=t.flags,b=t.forSubtree,A=t.forDocumentTree,C=window.MutationObserver._isPolyfilled&&v["throttle-attached"];t.hasPolyfillMutations=C,t.hasThrottledAttached=C;var w=!1,x=[],E=Array.prototype.forEach.call.bind(Array.prototype.forEach),S=Element.prototype.createShadowRoot;S&&(Element.prototype.createShadowRoot=function(){var t=S.call(this);return window.CustomElements.watchShadow(this),t}),t.watchShadow=p,t.upgradeDocumentTree=y,t.upgradeDocument=m,t.upgradeSubtree=o,t.upgradeAll=e,t.attached=s,t.takeRecords=f}),window.CustomElements.addModule(function(t){function e(e,o){if("template"===e.localName&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate&&HTMLTemplateElement.decorate(e),!e.__upgraded__&&e.nodeType===Node.ELEMENT_NODE){var i=e.getAttribute("is"),r=t.getRegisteredDefinition(e.localName)||t.getRegisteredDefinition(i);if(r&&(i&&r.tag==e.localName||!i&&!r.extends))return n(e,r,o)}}function n(e,n,i){return s.upgrade&&console.group("upgrade:",e.localName),n.is&&e.setAttribute("is",n.is),o(e,n),e.__upgraded__=!0,r(e),i&&t.attached(e),t.upgradeSubtree(e,i),s.upgrade&&console.groupEnd(),e}function o(t,e){Object.__proto__?t.__proto__=e.prototype:(i(t,e.prototype,e.native),t.__proto__=e.prototype)}function i(t,e,n){for(var o={},i=e;i!==n&&i!==HTMLElement.prototype;){for(var r,s=Object.getOwnPropertyNames(i),a=0;r=s[a];a++)o[r]||(Object.defineProperty(t,r,Object.getOwnPropertyDescriptor(i,r)),o[r]=1);i=Object.getPrototypeOf(i)}}function r(t){t.createdCallback&&t.createdCallback()}var s=t.flags;t.upgrade=e,t.upgradeWithDefinition=n,t.implementPrototype=o}),window.CustomElements.addModule(function(t){function e(e,o){var u=o||{};if(!e)throw new Error("document.registerElement: first argument `name` must not be empty");if(e.indexOf("-")<0)throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '"+String(e)+"'.");if(i(e))throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '"+String(e)+"'. The type name is invalid.");if(c(e))throw new Error("DuplicateDefinitionError: a type with name '"+String(e)+"' is already registered");return u.prototype||(u.prototype=Object.create(HTMLElement.prototype)),u.__name=e.toLowerCase(),u.extends&&(u.extends=u.extends.toLowerCase()),u.lifecycle=u.lifecycle||{},u.ancestry=r(u.extends),s(u),a(u),n(u.prototype),l(u.__name,u),u.ctor=h(u),u.ctor.prototype=u.prototype,u.prototype.constructor=u.ctor,t.ready&&m(document),u.ctor}function n(t){if(!t.setAttribute._polyfilled){var e=t.setAttribute;t.setAttribute=function(t,n){o.call(this,t,n,e)};var n=t.removeAttribute;t.removeAttribute=function(t){o.call(this,t,null,n)},t.setAttribute._polyfilled=!0}}function o(t,e,n){t=t.toLowerCase();var o=this.getAttribute(t);n.apply(this,arguments);var i=this.getAttribute(t);this.attributeChangedCallback&&i!==o&&this.attributeChangedCallback(t,o,i)}function i(t){for(var e=0;e<C.length;e++)if(t===C[e])return!0}function r(t){var e=c(t);return e?r(e.extends).concat([e]):[]}function s(t){for(var e,n=t.extends,o=0;e=t.ancestry[o];o++)n=e.is&&e.tag;t.tag=n||t.__name,n&&(t.is=t.__name)}function a(t){if(!Object.__proto__){var e=HTMLElement.prototype;if(t.is){var n=document.createElement(t.tag);e=Object.getPrototypeOf(n)}for(var o,i=t.prototype,r=!1;i;)i==e&&(r=!0),o=Object.getPrototypeOf(i),o&&(i.__proto__=o),i=o;r||console.warn(t.tag+" prototype not found in prototype chain for "+t.is),t.native=e}}function u(t){return v(E(t.tag),t)}function c(t){return t?w[t.toLowerCase()]:void 0}function l(t,e){w[t]=e}function h(t){return function(){return u(t)}}function p(t,e,n){return t===x?d(e,n):S(t,e)}function d(t,e){t&&(t=t.toLowerCase()),e&&(e=e.toLowerCase());var n=c(e||t);if(n){if(t==n.tag&&e==n.is)return new n.ctor;if(!e&&!n.is)return new n.ctor}var o;return e?(o=d(t),o.setAttribute("is",e),o):(o=E(t),t.indexOf("-")>=0&&b(o,HTMLElement),o)}function f(t,e){var n=t[e];t[e]=function(){var t=n.apply(this,arguments);return y(t),t}}var g,m=(t.isIE,t.upgradeDocumentTree),y=t.upgradeAll,v=t.upgradeWithDefinition,b=t.implementPrototype,A=t.useNative,C=["annotation-xml","color-profile","font-face","font-face-src","font-face-uri","font-face-format","font-face-name","missing-glyph"],w={},x="http://www.w3.org/1999/xhtml",E=document.createElement.bind(document),S=document.createElementNS.bind(document);g=Object.__proto__||A?function(t,e){return t instanceof e}:function(t,e){if(t instanceof e)return!0;for(var n=t;n;){if(n===e.prototype)return!0;n=n.__proto__}return!1},f(Node.prototype,"cloneNode"),f(document,"importNode"),document.registerElement=e,document.createElement=d,document.createElementNS=p,t.registry=w,t.instanceof=g,t.reservedTagList=C,t.getRegisteredDefinition=c,document.register=document.registerElement}),function(t){function e(){r(window.wrap(document)),window.CustomElements.ready=!0;var t=window.requestAnimationFrame||function(t){setTimeout(t,16)};t(function(){setTimeout(function(){window.CustomElements.readyTime=Date.now(),window.HTMLImports&&(window.CustomElements.elapsed=window.CustomElements.readyTime-window.HTMLImports.readyTime),document.dispatchEvent(new CustomEvent("WebComponentsReady",{bubbles:!0}))})})}{var n=t.useNative,o=t.initializeModules;t.isIE}if(n){var i=function(){};t.watchShadow=i,t.upgrade=i,t.upgradeAll=i,t.upgradeDocumentTree=i,t.upgradeSubtree=i,t.takeRecords=i,t.instanceof=function(t,e){return t instanceof e}}else o();var r=t.upgradeDocumentTree,s=t.upgradeDocument;if(window.wrap||(window.ShadowDOMPolyfill?(window.wrap=window.ShadowDOMPolyfill.wrapIfNeeded,window.unwrap=window.ShadowDOMPolyfill.unwrapIfNeeded):window.wrap=window.unwrap=function(t){return t}),window.HTMLImports&&(window.HTMLImports.__importsParsingHook=function(t){t.import&&s(wrap(t.import))}),"complete"===document.readyState||t.flags.eager)e();else if("interactive"!==document.readyState||window.attachEvent||window.HTMLImports&&!window.HTMLImports.ready){var a=window.HTMLImports&&!window.HTMLImports.ready?"HTMLImportsLoaded":"DOMContentLoaded";window.addEventListener(a,e)}else e()}(window.CustomElements),function(){}.call(this),function(){var t=this;(function(){(function(){this.Trix={VERSION:"0.10.2",ZERO_WIDTH_SPACE:"\ufeff",NON_BREAKING_SPACE:"\xa0",OBJECT_REPLACEMENT_CHARACTER:"\ufffc",config:{}}}).call(this)}).call(t);var e=t.Trix;(function(){(function(){e.BasicObject=function(){function t(){}var e,n,o;return t.proxyMethod=function(t){var o,i,r,s,a;return r=n(t),o=r.name,s=r.toMethod,a=r.toProperty,i=r.optional,this.prototype[o]=function(){var t,n;return t=null!=s?i?"function"==typeof this[s]?this[s]():void 0:this[s]():null!=a?this[a]:void 0,i?(n=null!=t?t[o]:void 0,null!=n?e.call(n,t,arguments):void 0):(n=t[o],e.call(n,t,arguments))}},n=function(t){var e,n;if(!(n=t.match(o)))throw new Error("can't parse @proxyMethod expression: "+t);return e={name:n[4]},null!=n[2]?e.toMethod=n[1]:e.toProperty=n[1],null!=n[3]&&(e.optional=!0),e},e=Function.prototype.apply,o=/^(.+?)(\(\))?(\?)?\.(.+?)$/,t}()}).call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Object=function(n){function o(){this.id=++i}var i;return t(o,n),i=0,o.fromJSONString=function(t){return this.fromJSON(JSON.parse(t))},o.prototype.hasSameConstructorAs=function(t){return this.constructor===(null!=t?t.constructor:void 0)},o.prototype.isEqualTo=function(t){return this===t},o.prototype.inspect=function(){var t,e,n;return t=function(){var t,o,i;o=null!=(t=this.contentsForInspection())?t:{},i=[];for(e in o)n=o[e],i.push(e+"="+n);return i}.call(this),"#<"+this.constructor.name+":"+this.id+(t.length?" "+t.join(", "):"")+">"},o.prototype.contentsForInspection=function(){},o.prototype.toJSONString=function(){return JSON.stringify(this)},o.prototype.toUTF16String=function(){return e.UTF16String.box(this)},o.prototype.getCacheKey=function(){return this.id.toString()},o}(e.BasicObject)}.call(this),function(){e.extend=function(t){var e,n;for(e in t)n=t[e],this[e]=n;return this}}.call(this),function(){e.extend({defer:function(t){return setTimeout(t,1)}})}.call(this),function(){var t,n;e.extend({normalizeSpaces:function(t){return t.replace(RegExp(""+e.ZERO_WIDTH_SPACE,"g"),"").replace(RegExp(""+e.NON_BREAKING_SPACE,"g")," ")},normalizeNewlines:function(t){return t.replace(/\r\n/g,"\n")},summarizeStringChange:function(t,o){var i,r,s,a;return t=e.UTF16String.box(t),o=e.UTF16String.box(o),o.length<t.length?(r=n(t,o),a=r[0],i=r[1]):(s=n(o,t),i=s[0],a=s[1]),{added:i,removed:a}}}),n=function(n,o){var i,r,s,a,u;return n.isEqualTo(o)?["",""]:(r=t(n,o),a=r.utf16String.length,s=a?(u=r.offset,r,i=n.codepoints.slice(0,u).concat(n.codepoints.slice(u+a)),t(o,e.UTF16String.fromCodepoints(i))):t(o,n),[r.utf16String.toString(),s.utf16String.toString()])},t=function(t,e){var n,o,i;for(n=0,o=t.length,i=e.length;o>n&&t.charAt(n).isEqualTo(e.charAt(n));)n++;for(;o>n+1&&t.charAt(o-1).isEqualTo(e.charAt(i-1));)o--,i--;return{utf16String:t.slice(n,o),offset:n}}}.call(this),function(){e.extend({copyObject:function(t){var e,n,o;null==t&&(t={}),n={};for(e in t)o=t[e],n[e]=o;return n},objectsAreEqual:function(t,e){var n,o;if(null==t&&(t={}),null==e&&(e={}),Object.keys(t).length!==Object.keys(e).length)return!1;for(n in t)if(o=t[n],o!==e[n])return!1;return!0}})}.call(this),function(){var t=[].slice;e.extend({arraysAreEqual:function(t,e){var n,o,i,r;if(null==t&&(t=[]),null==e&&(e=[]),t.length!==e.length)return!1;for(o=n=0,i=t.length;i>n;o=++n)if(r=t[o],r!==e[o])return!1;return!0},arrayStartsWith:function(t,n){return null==t&&(t=[]),null==n&&(n=[]),e.arraysAreEqual(t.slice(0,n.length),n)},spliceArray:function(){var e,n,o;return n=arguments[0],e=2<=arguments.length?t.call(arguments,1):[],o=n.slice(0),o.splice.apply(o,e),o},summarizeArrayChange:function(t,e){var n,o,i,r,s,a,u,c,l,h,p;for(null==t&&(t=[]),null==e&&(e=[]),n=[],h=[],i=new Set,r=0,u=t.length;u>r;r++)p=t[r],i.add(p);for(o=new Set,s=0,c=e.length;c>s;s++)p=e[s],o.add(p),i.has(p)||n.push(p);for(a=0,l=t.length;l>a;a++)p=t[a],o.has(p)||h.push(p);return{added:n,removed:h}}})}.call(this),function(){var t,n,o,i;t=null,n=null,i=null,o=null,e.extend({getAllAttributeNames:function(){return null!=t?t:t=e.getTextAttributeNames().concat(e.getBlockAttributeNames())},getBlockConfig:function(t){return e.config.blockAttributes[t]},getBlockAttributeNames:function(){return null!=n?n:n=Object.keys(e.config.blockAttributes)},getTextConfig:function(t){return e.config.textAttributes[t]},getTextAttributeNames:function(){return null!=i?i:i=Object.keys(e.config.textAttributes)},getListAttributeNames:function(){var t,n;return null!=o?o:o=function(){var o,i;o=e.config.blockAttributes,i=[];for(t in o)n=o[t].listAttribute,null!=n&&i.push(n);return i}()}})}.call(this),function(){var t,n,o,i,r,s=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=document.documentElement,n=null!=(o=null!=(i=null!=(r=t.matchesSelector)?r:t.webkitMatchesSelector)?i:t.msMatchesSelector)?o:t.mozMatchesSelector,e.extend({handleEvent:function(n,o){var i,r,s,a,u,c,l,h,p,d,f,g;return h=null!=o?o:{},c=h.onElement,u=h.matchingSelector,g=h.withCallback,a=h.inPhase,l=h.preventDefault,d=h.times,r=null!=c?c:t,p=u,i=g,f="capturing"===a,s=function(t){var n;return null!=d&&0===--d&&s.destroy(),n=e.findClosestElementFromNode(t.target,{matchingSelector:p}),null!=n&&(null!=g&&g.call(n,t,n),l)?t.preventDefault():void 0},s.destroy=function(){return r.removeEventListener(n,s,f)},r.addEventListener(n,s,f),s},handleEventOnce:function(t,n){return null==n&&(n={}),n.times=1,e.handleEvent(t,n)},triggerEvent:function(n,o){var i,r,s,a,u,c,l;return l=null!=o?o:{},c=l.onElement,r=l.bubbles,s=l.cancelable,i=l.attributes,a=null!=c?c:t,r=r!==!1,s=s!==!1,u=document.createEvent("Events"),u.initEvent(n,r,s),null!=i&&e.extend.call(u,i),a.dispatchEvent(u)},elementMatchesSelector:function(t,e){return 1===(null!=t?t.nodeType:void 0)?n.call(t,e):void 0},findClosestElementFromNode:function(t,n){var o,i,r;for(i=null!=n?n:{},o=i.matchingSelector,r=i.untilNode;null!=t&&t.nodeType!==Node.ELEMENT_NODE;)t=t.parentNode;if(null!=t){if(null==o)return t;if(t.closest&&null==r)return t.closest(o);for(;t&&t!==r;){if(e.elementMatchesSelector(t,o))return t;t=t.parentNode}}},findInnerElement:function(t){for(;null!=t?t.firstElementChild:void 0;)t=t.firstElementChild;return t},innerElementIsActive:function(t){return document.activeElement!==t&&e.elementContainsNode(t,document.activeElement)},elementContainsNode:function(t,e){if(t&&e)for(;e;){if(e===t)return!0;e=e.parentNode}},findNodeFromContainerAndOffset:function(t,e){var n;if(t)return t.nodeType===Node.TEXT_NODE?t:0===e?null!=(n=t.firstChild)?n:t:t.childNodes.item(e-1)},findElementFromContainerAndOffset:function(t,n){var o;return o=e.findNodeFromContainerAndOffset(t,n),e.findClosestElementFromNode(o)},findChildIndexOfNode:function(t){var e;if(null!=t?t.parentNode:void 0){for(e=0;t=t.previousSibling;)e++;return e}},walkTree:function(t,e){var n,o,i,r,s;return i=null!=e?e:{},o=i.onlyNodesOfType,r=i.usingFilter,n=i.expandEntityReferences,s=function(){switch(o){case"element":return NodeFilter.SHOW_ELEMENT;case"text":return NodeFilter.SHOW_TEXT;case"comment":return NodeFilter.SHOW_COMMENT;default:return NodeFilter.SHOW_ALL}}(),document.createTreeWalker(t,s,null!=r?r:null,n===!0)},tagName:function(t){var e;return null!=t&&null!=(e=t.tagName)?e.toLowerCase():void 0},makeElement:function(t,e){var n,o,i,r,s,a,u,c,l,h;if(null==e&&(e={}),"object"==typeof t?(e=t,t=e.tagName):e={attributes:e},o=document.createElement(t),null!=e.editable&&(null==e.attributes&&(e.attributes={}),e.attributes.contenteditable=e.editable),e.attributes){a=e.attributes;for(r in a)h=a[r],o.setAttribute(r,h)}if(e.style){u=e.style;for(r in u)h=u[r],o.style[r]=h}if(e.data){c=e.data;for(r in c)h=c[r],o.dataset[r]=h}if(e.className)for(l=e.className.split(" "),i=0,s=l.length;s>i;i++)n=l[i],o.classList.add(n);return e.textContent&&(o.textContent=e.textContent),o},cloneFragment:function(t){var e,n,o,i,r;for(e=document.createDocumentFragment(),r=t.childNodes,n=0,o=r.length;o>n;n++)i=r[n],e.appendChild(i.cloneNode(!0));return e},makeFragment:function(t){var e,n,o;for(null==t&&(t=""),e=document.createElement("div"),e.innerHTML=t,n=document.createDocumentFragment();o=e.firstChild;)n.appendChild(o);return n},getBlockTagNames:function(){var t,n;return null!=e.blockTagNames?e.blockTagNames:e.blockTagNames=function(){var o,i;o=e.config.blockAttributes,i=[];for(t in o)n=o[t],i.push(n.tagName);return i}()},nodeIsBlockContainer:function(t){return e.nodeIsBlockStartComment(null!=t?t.firstChild:void 0)},nodeProbablyIsBlockContainer:function(t){var n,o;return n=e.tagName(t),s.call(e.getBlockTagNames(),n)>=0&&(o=e.tagName(t.firstChild),s.call(e.getBlockTagNames(),o)<0)},nodeIsBlockStart:function(t,n){var o;return o=(null!=n?n:{strict:!0}).strict,o?e.nodeIsBlockStartComment(t):e.nodeIsBlockStartComment(t)||!e.nodeIsBlockStartComment(t.firstChild)&&e.nodeProbablyIsBlockContainer(t)},nodeIsBlockStartComment:function(t){return e.nodeIsCommentNode(t)&&"block"===(null!=t?t.data:void 0)},nodeIsCommentNode:function(t){return(null!=t?t.nodeType:void 0)===Node.COMMENT_NODE},nodeIsCursorTarget:function(t){return t?e.nodeIsTextNode(t)?t.data===e.ZERO_WIDTH_SPACE:e.nodeIsCursorTarget(t.firstChild):void 0},nodeIsAttachmentElement:function(t){return e.elementMatchesSelector(t,e.AttachmentView.attachmentSelector)},nodeIsEmptyTextNode:function(t){return e.nodeIsTextNode(t)&&""===(null!=t?t.data:void 0)},nodeIsTextNode:function(t){return(null!=t?t.nodeType:void 0)===Node.TEXT_NODE}})}.call(this),function(){var t,n,o,i,r;t=e.copyObject,i=e.objectsAreEqual,e.extend({normalizeRange:o=function(t){var e;if(null!=t)return Array.isArray(t)||(t=[t,t]),[n(t[0]),n(null!=(e=t[1])?e:t[0])]},rangeIsCollapsed:function(t){var e,n,i;if(null!=t)return n=o(t),i=n[0],e=n[1],r(i,e)},rangesAreEqual:function(t,e){var n,i,s,a,u,c;if(null!=t&&null!=e)return s=o(t),i=s[0],n=s[1],a=o(e),c=a[0],u=a[1],r(i,c)&&r(n,u)}}),n=function(e){return"number"==typeof e?e:t(e)},r=function(t,e){return"number"==typeof t?t===e:i(t,e)}}.call(this),function(){var t,n,o,i;t={extendsTagName:"div",css:"%t { display: block; }"},e.registerElement=function(e,n){var r,s,a,u,c,l,h;return null==n&&(n={}),e=e.toLowerCase(),c=i(n),u=null!=(h=c.extendsTagName)?h:t.extendsTagName,delete c.extendsTagName,s=c.defaultCSS,delete c.defaultCSS,null!=s&&u===t.extendsTagName?s+="\n"+t.css:s=t.css,o(s,e),a=Object.getPrototypeOf(document.createElement(u)),a.__super__=a,l=Object.create(a,c),r=document.registerElement(e,{prototype:l}),Object.defineProperty(l,"constructor",{value:r}),r},o=function(t,e){var o;return o=n(e),o.textContent=t.replace(/%t/g,e)},n=function(t){var e;return e=document.createElement("style"),e.setAttribute("type","text/css"),e.setAttribute("data-tag-name",t.toLowerCase()),document.head.insertBefore(e,document.head.firstChild),e},i=function(t){var e,n,o;n={};for(e in t)o=t[e],n[e]="function"==typeof o?{value:o}:o;return n}}.call(this),function(){var t,n;e.extend({getDOMSelection:function(){var t;return t=window.getSelection(),t.rangeCount>0?t:void 0},getDOMRange:function(){var n,o;return(n=null!=(o=e.getDOMSelection())?o.getRangeAt(0):void 0)&&!t(n)?n:void 0},setDOMRange:function(t){var n;return n=window.getSelection(),n.removeAllRanges(),n.addRange(t),e.selectionChangeObserver.update()}}),t=function(t){return n(t.startContainer)||n(t.endContainer)},n=function(t){return!Object.getPrototypeOf(t)}}.call(this),function(){}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty;t=e.arraysAreEqual,e.Hash=function(o){function i(t){null==t&&(t={}),this.values=s(t),i.__super__.constructor.apply(this,arguments)}var r,s,a,u,c;return n(i,o),i.fromCommonAttributesOfObjects=function(t){var e,n,o,i,s,a;if(null==t&&(t=[]),!t.length)return new this;for(e=r(t[0]),o=e.getKeys(),a=t.slice(1),n=0,i=a.length;i>n;n++)s=a[n],o=e.getKeysCommonToHash(r(s)),e=e.slice(o);return e},i.box=function(t){return r(t)},i.prototype.add=function(t,e){return this.merge(u(t,e))},i.prototype.remove=function(t){return new e.Hash(s(this.values,t))},i.prototype.get=function(t){return this.values[t]},i.prototype.has=function(t){return t in this.values},i.prototype.merge=function(t){return new e.Hash(a(this.values,c(t)))},i.prototype.slice=function(t){var n,o,i,r;for(r={},n=0,i=t.length;i>n;n++)o=t[n],this.has(o)&&(r[o]=this.values[o]);return new e.Hash(r)},i.prototype.getKeys=function(){return Object.keys(this.values)},i.prototype.getKeysCommonToHash=function(t){var e,n,o,i,s;for(t=r(t),i=this.getKeys(),s=[],e=0,o=i.length;o>e;e++)n=i[e],this.values[n]===t.values[n]&&s.push(n);return s},i.prototype.isEqualTo=function(e){return t(this.toArray(),r(e).toArray())},i.prototype.isEmpty=function(){return 0===this.getKeys().length},i.prototype.toArray=function(){var t,e,n;return(null!=this.array?this.array:this.array=function(){var o;e=[],o=this.values;for(t in o)n=o[t],e.push(t,n);return e}.call(this)).slice(0)},i.prototype.toObject=function(){return s(this.values)},i.prototype.toJSON=function(){return this.toObject()},i.prototype.contentsForInspection=function(){return{values:JSON.stringify(this.values)}},u=function(t,e){var n;return n={},n[t]=e,n},a=function(t,e){var n,o,i;o=s(t);for(n in e)i=e[n],o[n]=i;return o},s=function(t,e){var n,o,i,r,s;for(r={},s=Object.keys(t).sort(),n=0,i=s.length;i>n;n++)o=s[n],o!==e&&(r[o]=t[o]);return r},r=function(t){return t instanceof e.Hash?t:new e.Hash(t)},c=function(t){return t instanceof e.Hash?t.values:t},i}(e.Object)}.call(this),function(){e.ObjectGroup=function(){function t(t,e){var n,o;this.objects=null!=t?t:[],o=e.depth,n=e.asTree,n&&(this.depth=o,this.objects=this.constructor.groupObjects(this.objects,{asTree:n,depth:this.depth+1}))}return t.groupObjects=function(t,e){var n,o,i,r,s,a,u,c,l;for(null==t&&(t=[]),l=null!=e?e:{},i=l.depth,n=l.asTree,n&&null==i&&(i=0),c=[],s=0,a=t.length;a>s;s++){if(u=t[s],r){if(("function"==typeof u.canBeGrouped?u.canBeGrouped(i):void 0)&&("function"==typeof(o=r[r.length-1]).canBeGroupedWith?o.canBeGroupedWith(u,i):void 0)){r.push(u);continue}c.push(new this(r,{depth:i,asTree:n})),r=null}("function"==typeof u.canBeGrouped?u.canBeGrouped(i):void 0)?r=[u]:c.push(u)}return r&&c.push(new this(r,{depth:i,asTree:n})),c},t.prototype.getObjects=function(){return this.objects},t.prototype.getDepth=function(){return this.depth},t.prototype.getCacheKey=function(){var t,e,n,o,i;for(e=["objectGroup"],i=this.getObjects(),t=0,n=i.length;n>t;t++)o=i[t],e.push(o.getCacheKey());return e.join("/")},t}()}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ObjectMap=function(e){function n(t){var e,n,o,i,r;for(null==t&&(t=[]),this.objects={},o=0,i=t.length;i>o;o++)r=t[o],n=JSON.stringify(r),null==(e=this.objects)[n]&&(e[n]=r)}return t(n,e),n.prototype.find=function(t){var e;return e=JSON.stringify(t),this.objects[e]},n}(e.BasicObject)}.call(this),function(){e.ElementStore=function(){function t(t){this.reset(t)}var e;return t.prototype.add=function(t){var n;return n=e(t),this.elements[n]=t},t.prototype.remove=function(t){var n,o;return n=e(t),(o=this.elements[n])?(delete this.elements[n],o):void 0},t.prototype.reset=function(t){var e,n,o;for(null==t&&(t=[]),this.elements={},n=0,o=t.length;o>n;n++)e=t[n],this.add(e);return t},e=function(t){return t.dataset.trixStoreKey},t}()}.call(this),function(){}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Operation=function(e){function n(){return n.__super__.constructor.apply(this,arguments)}return t(n,e),n.prototype.isPerforming=function(){return this.performing===!0},n.prototype.hasPerformed=function(){return this.performed===!0},n.prototype.hasSucceeded=function(){return this.performed&&this.succeeded},n.prototype.hasFailed=function(){return this.performed&&!this.succeeded},n.prototype.getPromise=function(){return null!=this.promise?this.promise:this.promise=new Promise(function(t){return function(e,n){return t.performing=!0,t.perform(function(o,i){return t.succeeded=o,t.performing=!1,t.performed=!0,t.succeeded?e(i):n(i)})}}(this))},n.prototype.perform=function(t){return t(!1)},n.prototype.release=function(){var t;return null!=(t=this.promise)&&"function"==typeof t.cancel&&t.cancel(),this.promise=null,this.performing=null,this.performed=null,this.succeeded=null
},n.proxyMethod("getPromise().then"),n.proxyMethod("getPromise().catch"),n}(e.BasicObject)}.call(this),function(){var t,n,o,i,r,s=function(t,e){function n(){this.constructor=t}for(var o in e)a.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},a={}.hasOwnProperty;e.UTF16String=function(t){function e(t,e){this.ucs2String=t,this.codepoints=e,this.length=this.codepoints.length,this.ucs2Length=this.ucs2String.length}return s(e,t),e.box=function(t){return null==t&&(t=""),t instanceof this?t:this.fromUCS2String(null!=t?t.toString():void 0)},e.fromUCS2String=function(t){return new this(t,i(t))},e.fromCodepoints=function(t){return new this(r(t),t)},e.prototype.offsetToUCS2Offset=function(t){return r(this.codepoints.slice(0,Math.max(0,t))).length},e.prototype.offsetFromUCS2Offset=function(t){return i(this.ucs2String.slice(0,Math.max(0,t))).length},e.prototype.slice=function(){var t;return this.constructor.fromCodepoints((t=this.codepoints).slice.apply(t,arguments))},e.prototype.charAt=function(t){return this.slice(t,t+1)},e.prototype.isEqualTo=function(t){return this.constructor.box(t).ucs2String===this.ucs2String},e.prototype.toJSON=function(){return this.ucs2String},e.prototype.getCacheKey=function(){return this.ucs2String},e.prototype.toString=function(){return this.ucs2String},e}(e.BasicObject),t=1===("function"==typeof Array.from?Array.from("\ud83d\udc7c").length:void 0),n=null!=("function"==typeof" ".codePointAt?" ".codePointAt(0):void 0),o=" \ud83d\udc7c"===("function"==typeof String.fromCodePoint?String.fromCodePoint(32,128124):void 0),i=t&&n?function(t){return Array.from(t).map(function(t){return t.codePointAt(0)})}:function(t){var e,n,o,i,r;for(i=[],e=0,o=t.length;o>e;)r=t.charCodeAt(e++),r>=55296&&56319>=r&&o>e&&(n=t.charCodeAt(e++),56320===(64512&n)?r=((1023&r)<<10)+(1023&n)+65536:e--),i.push(r);return i},r=o?function(t){return String.fromCodePoint.apply(String,t)}:function(t){var e,n,o;return e=function(){var e,i,r;for(r=[],e=0,i=t.length;i>e;e++)o=t[e],n="",o>65535&&(o-=65536,n+=String.fromCharCode(o>>>10&1023|55296),o=56320|1023&o),r.push(n+String.fromCharCode(o));return r}(),e.join("")}}.call(this),function(){}.call(this),function(){}.call(this),function(){e.config.lang={bold:"Bold",bullets:"Bullets","byte":"Byte",bytes:"Bytes",captionPlaceholder:"Type a caption here\u2026",captionPrompt:"Add a caption\u2026",code:"Code",heading1:"Heading",indent:"Increase Level",italic:"Italic",link:"Link",numbers:"Numbers",outdent:"Decrease Level",quote:"Quote",redo:"Redo",remove:"Remove",strike:"Strikethrough",undo:"Undo",unlink:"Unlink",urlPlaceholder:"Enter a URL\u2026",GB:"GB",KB:"KB",MB:"MB",PB:"PB",TB:"TB"}}.call(this),function(){e.config.css={classNames:{attachment:{container:"attachment",typePrefix:"attachment-",caption:"caption",captionEdited:"caption-edited",captionEditor:"caption-editor",editingCaption:"caption-editing",progressBar:"progress",removeButton:"remove icon",size:"size"}}}}.call(this),function(){var t;e.config.blockAttributes=t={"default":{tagName:"div",parse:!1},quote:{tagName:"blockquote",nestable:!0},heading1:{tagName:"h1",terminal:!0,breakOnReturn:!0,group:!1},code:{tagName:"pre",terminal:!0,text:{plaintext:!0}},bulletList:{tagName:"ul",parse:!1},bullet:{tagName:"li",listAttribute:"bulletList",group:!1,nestable:!0,test:function(n){return e.tagName(n.parentNode)===t[this.listAttribute].tagName}},numberList:{tagName:"ol",parse:!1},number:{tagName:"li",listAttribute:"numberList",group:!1,nestable:!0,test:function(n){return e.tagName(n.parentNode)===t[this.listAttribute].tagName}}}}.call(this),function(){var t,n;t=e.config.lang,n=[t.bytes,t.KB,t.MB,t.GB,t.TB,t.PB],e.config.fileSize={prefix:"IEC",precision:2,formatter:function(e){var o,i,r,s,a;switch(e){case 0:return"0 "+t.bytes;case 1:return"1 "+t.byte;default:return o=function(){switch(this.prefix){case"SI":return 1e3;case"IEC":return 1024}}.call(this),i=Math.floor(Math.log(e)/Math.log(o)),r=e/Math.pow(o,i),s=r.toFixed(this.precision),a=s.replace(/0*$/,"").replace(/\.$/,""),a+" "+n[i]}}}}.call(this),function(){e.config.textAttributes={bold:{tagName:"strong",inheritable:!0,parser:function(t){var e;return e=window.getComputedStyle(t),"bold"===e.fontWeight||e.fontWeight>=600}},italic:{tagName:"em",inheritable:!0,parser:function(t){var e;return e=window.getComputedStyle(t),"italic"===e.fontStyle}},href:{groupTagName:"a",parser:function(t){var n,o,i;return n=e.AttachmentView.attachmentSelector,i="a:not("+n+")",(o=e.findClosestElementFromNode(t,{matchingSelector:i}))?o.getAttribute("href"):void 0}},strike:{tagName:"del",inheritable:!0},frozen:{style:{backgroundColor:"highlight"}}}}.call(this),function(){var t,n,o,i,r;r="[data-trix-serialize=false]",i=["contenteditable","data-trix-id","data-trix-store-key","data-trix-mutable"],n="data-trix-serialized-attributes",o="["+n+"]",t=new RegExp("<!--block-->","g"),e.extend({serializers:{"application/json":function(t){var n;if(t instanceof e.Document)n=t;else{if(!(t instanceof HTMLElement))throw new Error("unserializable object");n=e.Document.fromHTML(t.innerHTML)}return n.toSerializableDocument().toJSONString()},"text/html":function(s){var a,u,c,l,h,p,d,f,g,m,y,v,b,A,C,w,x;if(s instanceof e.Document)l=e.DocumentView.render(s);else{if(!(s instanceof HTMLElement))throw new Error("unserializable object");l=s.cloneNode(!0)}for(A=l.querySelectorAll(r),h=0,g=A.length;g>h;h++)c=A[h],c.parentNode.removeChild(c);for(p=0,m=i.length;m>p;p++)for(a=i[p],C=l.querySelectorAll("["+a+"]"),d=0,y=C.length;y>d;d++)c=C[d],c.removeAttribute(a);for(w=l.querySelectorAll(o),f=0,v=w.length;v>f;f++){c=w[f];try{u=JSON.parse(c.getAttribute(n)),c.removeAttribute(n);for(b in u)x=u[b],c.setAttribute(b,x)}catch(E){}}return l.innerHTML.replace(t,"")}},deserializers:{"application/json":function(t){return e.Document.fromJSONString(t)},"text/html":function(t){return e.Document.fromHTML(t)}},serializeToContentType:function(t,n){var o;if(o=e.serializers[n])return o(t);throw new Error("unknown content type: "+n)},deserializeFromContentType:function(t,n){var o;if(o=e.deserializers[n])return o(t);throw new Error("unknown content type: "+n)}})}.call(this),function(){var t,n;n=e.makeFragment,t=e.config.lang,e.config.toolbar={content:n('<div class="button_row">\n  <span class="button_group text_tools">\n    <button type="button" class="icon bold" data-trix-attribute="bold" data-trix-key="b" title="'+t.bold+'" tabindex="-1">'+t.bold+'</button>\n    <button type="button" class="icon italic" data-trix-attribute="italic" data-trix-key="i" title="'+t.italic+'" tabindex="-1">'+t.italic+'</button>\n    <button type="button" class="icon strike" data-trix-attribute="strike" title="'+t.strike+'" tabindex="-1">'+t.strike+'</button>\n    <button type="button" class="icon link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="'+t.link+'" tabindex="-1">'+t.link+'</button>\n  </span>\n\n  <span class="button_group block_tools">\n    <button type="button" class="icon heading-1" data-trix-attribute="heading1" title="'+t.heading1+'" tabindex="-1">'+t.heading1+'</button>\n    <button type="button" class="icon quote" data-trix-attribute="quote" title="'+t.quote+'" tabindex="-1">'+t.quote+'</button>\n    <button type="button" class="icon code" data-trix-attribute="code" title="'+t.code+'" tabindex="-1">'+t.code+'</button>\n    <button type="button" class="icon list bullets" data-trix-attribute="bullet" title="'+t.bullets+'" tabindex="-1">'+t.bullets+'</button>\n    <button type="button" class="icon list numbers" data-trix-attribute="number" title="'+t.numbers+'" tabindex="-1">'+t.numbers+'</button>\n    <button type="button" class="icon nesting-level decrease" data-trix-action="decreaseNestingLevel" title="'+t.outdent+'" tabindex="-1">'+t.outdent+'</button>\n    <button type="button" class="icon nesting-level increase" data-trix-action="increaseNestingLevel" title="'+t.indent+'" tabindex="-1">'+t.indent+'</button>\n  </span>\n\n  <span class="button_group history_tools">\n    <button type="button" class="icon undo" data-trix-action="undo" data-trix-key="z" title="'+t.undo+'" tabindex="-1">'+t.undo+'</button>\n    <button type="button" class="icon redo" data-trix-action="redo" data-trix-key="shift+z" title="'+t.redo+'" tabindex="-1">'+t.redo+'</button>\n  </span>\n</div>\n\n<div class="dialogs">\n  <div class="dialog link_dialog" data-trix-attribute="href" data-trix-dialog="href">\n    <div class="link_url_fields">\n      <input type="url" required name="href" placeholder="'+t.urlPlaceholder+'">\n      <div class="button_group">\n        <input type="button" value="'+t.link+'" data-trix-method="setAttribute">\n        <input type="button" value="'+t.unlink+'" data-trix-method="removeAttribute">\n      </div>\n    </div>\n  </div>\n</div>')}}.call(this),function(){e.config.undoInterval=5e3}.call(this),function(){}.call(this),function(){var t;t=e.cloneFragment,e.registerElement("trix-toolbar",{defaultCSS:"%t {\n  white-space: nowrap;\n}\n\n%t .dialog {\n  display: none;\n}\n\n%t .dialog.active {\n  display: block;\n}\n\n%t .dialog input.validate:invalid {\n  background-color: #ffdddd;\n}\n\n%t[native] {\n  display: none;\n}",createdCallback:function(){return""===this.innerHTML?this.appendChild(t(e.config.toolbar.content)):void 0}})}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty,o=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};e.ObjectView=function(n){function i(t,e){this.object=t,this.options=null!=e?e:{},this.childViews=[],this.rootView=this}return t(i,n),i.prototype.getNodes=function(){var t,e,n,o,i;for(null==this.nodes&&(this.nodes=this.createNodes()),o=this.nodes,i=[],t=0,e=o.length;e>t;t++)n=o[t],i.push(n.cloneNode(!0));return i},i.prototype.invalidate=function(){var t;return this.nodes=null,null!=(t=this.parentView)?t.invalidate():void 0},i.prototype.invalidateViewForObject=function(t){var e;return null!=(e=this.findViewForObject(t))?e.invalidate():void 0},i.prototype.findOrCreateCachedChildView=function(t,e){var n;return(n=this.getCachedViewForObject(e))?this.recordChildView(n):(n=this.createChildView.apply(this,arguments),this.cacheViewForObject(n,e)),n},i.prototype.createChildView=function(t,n,o){var i;return null==o&&(o={}),n instanceof e.ObjectGroup&&(o.viewClass=t,t=e.ObjectGroupView),i=new t(n,o),this.recordChildView(i)},i.prototype.recordChildView=function(t){return t.parentView=this,t.rootView=this.rootView,o.call(this.childViews,t)<0&&this.childViews.push(t),t},i.prototype.getAllChildViews=function(){var t,e,n,o,i;for(i=[],o=this.childViews,e=0,n=o.length;n>e;e++)t=o[e],i.push(t),i=i.concat(t.getAllChildViews());return i},i.prototype.findElement=function(){return this.findElementForObject(this.object)},i.prototype.findElementForObject=function(t){var e;return(e=null!=t?t.id:void 0)?this.rootView.element.querySelector("[data-trix-id='"+e+"']"):void 0},i.prototype.findViewForObject=function(t){var e,n,o,i;for(o=this.getAllChildViews(),e=0,n=o.length;n>e;e++)if(i=o[e],i.object===t)return i},i.prototype.getViewCache=function(){return this.rootView!==this?this.rootView.getViewCache():this.isViewCachingEnabled()?null!=this.viewCache?this.viewCache:this.viewCache={}:void 0},i.prototype.isViewCachingEnabled=function(){return this.shouldCacheViews!==!1},i.prototype.enableViewCaching=function(){return this.shouldCacheViews=!0},i.prototype.disableViewCaching=function(){return this.shouldCacheViews=!1},i.prototype.getCachedViewForObject=function(t){var e;return null!=(e=this.getViewCache())?e[t.getCacheKey()]:void 0},i.prototype.cacheViewForObject=function(t,e){var n;return null!=(n=this.getViewCache())?n[e.getCacheKey()]=t:void 0},i.prototype.garbageCollectCachedViews=function(){var t,e,n,i,r,s;if(t=this.getViewCache()){s=this.getAllChildViews().concat(this),n=function(){var t,e,n;for(n=[],t=0,e=s.length;e>t;t++)r=s[t],n.push(r.object.getCacheKey());return n}(),i=[];for(e in t)o.call(n,e)<0&&i.push(delete t[e]);return i}},i}(e.BasicObject)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ObjectGroupView=function(e){function n(){n.__super__.constructor.apply(this,arguments),this.objectGroup=this.object,this.viewClass=this.options.viewClass,delete this.options.viewClass}return t(n,e),n.prototype.getChildViews=function(){var t,e,n,o;if(!this.childViews.length)for(o=this.objectGroup.getObjects(),t=0,e=o.length;e>t;t++)n=o[t],this.findOrCreateCachedChildView(this.viewClass,n,this.options);return this.childViews},n.prototype.createNodes=function(){var t,e,n,o,i,r,s,a,u;for(t=this.createContainerElement(),s=this.getChildViews(),e=0,o=s.length;o>e;e++)for(u=s[e],a=u.getNodes(),n=0,i=a.length;i>n;n++)r=a[n],t.appendChild(r);return[t]},n.prototype.createContainerElement=function(t){return null==t&&(t=this.objectGroup.getDepth()),this.getChildViews()[0].createContainerElement(t)},n}(e.ObjectView)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Controller=function(e){function n(){return n.__super__.constructor.apply(this,arguments)}return t(n,e),n}(e.BasicObject)}.call(this),function(){var t,n,o,i,r,s,a=function(t,e){return function(){return t.apply(e,arguments)}},u=function(t,e){function n(){this.constructor=t}for(var o in e)c.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},c={}.hasOwnProperty,l=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.findClosestElementFromNode,o=e.nodeIsEmptyTextNode,n=e.nodeIsBlockStartComment,i=e.normalizeSpaces,r=e.summarizeStringChange,s=e.tagName,e.MutationObserver=function(e){function c(t){this.element=t,this.didMutate=a(this.didMutate,this),this.observer=new window.MutationObserver(this.didMutate),this.start()}var h,p,d,f;return u(c,e),p="data-trix-mutable",d="["+p+"]",f={attributes:!0,childList:!0,characterData:!0,characterDataOldValue:!0,subtree:!0},c.prototype.start=function(){return this.reset(),this.observer.observe(this.element,f)},c.prototype.stop=function(){return this.observer.disconnect()},c.prototype.didMutate=function(t){var e,n;return(e=this.mutations).push.apply(e,this.findSignificantMutations(t)),this.mutations.length?(null!=(n=this.delegate)&&"function"==typeof n.elementDidMutate&&n.elementDidMutate(this.getMutationSummary()),this.reset()):void 0},c.prototype.reset=function(){return this.mutations=[]},c.prototype.findSignificantMutations=function(t){var e,n,o,i;for(i=[],e=0,n=t.length;n>e;e++)o=t[e],this.mutationIsSignificant(o)&&i.push(o);return i},c.prototype.mutationIsSignificant=function(t){var e,n,o,i;for(i=this.nodesModifiedByMutation(t),e=0,n=i.length;n>e;e++)if(o=i[e],this.nodeIsSignificant(o))return!0;return!1},c.prototype.nodeIsSignificant=function(t){return t!==this.element&&!this.nodeIsMutable(t)&&!o(t)},c.prototype.nodeIsMutable=function(e){return t(e,{matchingSelector:d})},c.prototype.nodesModifiedByMutation=function(t){var e;switch(e=[],t.type){case"attributes":t.attributeName!==p&&e.push(t.target);break;case"characterData":e.push(t.target.parentNode),e.push(t.target);break;case"childList":e.push.apply(e,t.addedNodes),e.push.apply(e,t.removedNodes)}return e},c.prototype.getMutationSummary=function(){return this.getTextMutationSummary()},c.prototype.getTextMutationSummary=function(){var t,e,n,o,i,r,s,a,u,c,h;for(a=this.getTextChangesFromCharacterData(),n=a.additions,i=a.deletions,h=this.getTextChangesFromChildList(),u=h.additions,r=0,s=u.length;s>r;r++)e=u[r],l.call(n,e)<0&&n.push(e);return i.push.apply(i,h.deletions),c={},(t=n.join(""))&&(c.textAdded=t),(o=i.join(""))&&(c.textDeleted=o),c},c.prototype.getMutationsByType=function(t){var e,n,o,i,r;for(i=this.mutations,r=[],e=0,n=i.length;n>e;e++)o=i[e],o.type===t&&r.push(o);return r},c.prototype.getTextChangesFromChildList=function(){var t,e,o,r,s,a,u,c,l,p,d;for(t=[],u=[],a=this.getMutationsByType("childList"),e=0,r=a.length;r>e;e++)s=a[e],t.push.apply(t,s.addedNodes),u.push.apply(u,s.removedNodes);return c=0===t.length&&1===u.length&&n(u[0]),c?(p=[],d=["\n"]):(p=h(t),d=h(u)),{additions:function(){var t,e,n;for(n=[],o=t=0,e=p.length;e>t;o=++t)l=p[o],l!==d[o]&&n.push(i(l));return n}(),deletions:function(){var t,e,n;for(n=[],o=t=0,e=d.length;e>t;o=++t)l=d[o],l!==p[o]&&n.push(i(l));return n}()}},c.prototype.getTextChangesFromCharacterData=function(){var t,e,n,o,s,a,u,c;return e=this.getMutationsByType("characterData"),e.length&&(c=e[0],n=e[e.length-1],s=i(c.oldValue),o=i(n.target.data),a=r(s,o),t=a.added,u=a.removed),{additions:t?[t]:[],deletions:u?[u]:[]}},h=function(t){var e,n,o,i;for(null==t&&(t=[]),i=[],e=0,n=t.length;n>e;e++)switch(o=t[e],o.nodeType){case Node.TEXT_NODE:i.push(o.data);break;case Node.ELEMENT_NODE:"br"===s(o)?i.push("\n"):i.push.apply(i,h(o.childNodes))}return i},c}(e.BasicObject)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.FileVerificationOperation=function(e){function n(t){this.file=t}return t(n,e),n.prototype.perform=function(t){var e;return e=new FileReader,e.onerror=function(){return t(!1)},e.onload=function(n){return function(){e.onerror=null;try{e.abort()}catch(o){}return t(!0,n.file)}}(this),e.readAsArrayBuffer(this.file)},n}(e.Operation)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.CompositionInput=function(e){function n(t){var e;this.inputController=t,e=this.inputController,this.responder=e.responder,this.delegate=e.delegate,this.inputSummary=e.inputSummary,this.data={}}return t(n,e),n.prototype.start=function(t){var e,n;return this.data.start=t,"keypress"===this.inputSummary.eventName&&this.inputSummary.textAdded&&null!=(e=this.responder)&&e.deleteInDirection("left"),this.selectionIsExpanded()||(this.insertPlaceholder(),this.requestRender()),this.range=null!=(n=this.responder)?n.getSelectedRange():void 0},n.prototype.update=function(t){var e;return this.data.update=t,(e=this.selectPlaceholder())?(this.forgetPlaceholder(),this.range=e):void 0},n.prototype.end=function(t){var e,n,o,i;return this.data.end=t,this.forgetPlaceholder(),this.canApplyToDocument()?(this.setInputSummary({preferDocument:!0}),null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),null!=(n=this.responder)&&n.setSelectedRange(this.range),null!=(o=this.responder)&&o.insertString(this.data.end),null!=(i=this.responder)?i.setSelectedRange(this.range[0]+this.data.end.length):void 0):null!=this.data.start||null!=this.data.update?(this.requestReparse(),this.inputController.reset()):void 0},n.prototype.getEndData=function(){return this.data.end},n.prototype.isEnded=function(){return null!=this.getEndData()},n.prototype.canApplyToDocument=function(){var t,e;return 0===(null!=(t=this.data.start)?t.length:void 0)&&(null!=(e=this.data.end)?e.length:void 0)>0&&null!=this.range},n.proxyMethod("inputController.setInputSummary"),n.proxyMethod("inputController.requestRender"),n.proxyMethod("inputController.requestReparse"),n.proxyMethod("responder?.selectionIsExpanded"),n.proxyMethod("responder?.insertPlaceholder"),n.proxyMethod("responder?.selectPlaceholder"),n.proxyMethod("responder?.forgetPlaceholder"),n}(e.BasicObject)}.call(this),function(){var t,n,o,i,r,s,a,u,c,l,h,p,d,f=function(t,e){function n(){this.constructor=t}for(var o in e)g.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},g={}.hasOwnProperty,m=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};i=e.handleEvent,c=e.makeElement,r=e.innerElementIsActive,l=e.objectsAreEqual,p=e.tagName,e.InputController=function(p){function d(t){var n;this.element=t,this.resetInputSummary(),this.mutationObserver=new e.MutationObserver(this.element),this.mutationObserver.delegate=this;for(n in this.events)i(n,{onElement:this.element,withCallback:this.handlerFor(n),inPhase:"capturing"})}var g;return f(d,p),g=0,d.keyNames={8:"backspace",9:"tab",13:"return",37:"left",39:"right",46:"delete",68:"d",72:"h",79:"o"},d.prototype.handlerFor=function(t){return function(e){return function(n){return e.handleInput(function(){return r(this.element)?void 0:(this.eventName=t,this.events[t].call(this,n))})}}(this)},d.prototype.setInputSummary=function(t){var e,n;null==t&&(t={}),this.inputSummary.eventName=this.eventName;for(e in t)n=t[e],this.inputSummary[e]=n;return this.inputSummary},d.prototype.resetInputSummary=function(){return this.inputSummary={}},d.prototype.reset=function(){return this.resetInputSummary(),e.selectionChangeObserver.reset()},d.prototype.editorWillSyncDocumentView=function(){return this.mutationObserver.stop()},d.prototype.editorDidSyncDocumentView=function(){return this.mutationObserver.start()},d.prototype.requestRender=function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.inputControllerDidRequestRender?t.inputControllerDidRequestRender():void 0},d.prototype.requestReparse=function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.inputControllerDidRequestReparse&&t.inputControllerDidRequestReparse(),this.requestRender()},d.prototype.elementDidMutate=function(t){var e;return this.isComposing()?null!=(e=this.delegate)&&"function"==typeof e.inputControllerDidAllowUnhandledInput?e.inputControllerDidAllowUnhandledInput():void 0:this.handleInput(function(){return this.mutationIsSignificant(t)&&(this.mutationIsExpected(t)?this.requestRender():this.requestReparse()),this.reset()})},d.prototype.mutationIsExpected=function(t){var e,n,o,i,r,s,a,u,c,l;return a=t.textAdded,u=t.textDeleted,this.inputSummary.preferDocument?!0:(e=null!=a?a===this.inputSummary.textAdded:!this.inputSummary.textAdded,n=null!=u?this.inputSummary.didDelete:!this.inputSummary.didDelete,c=("\n"===a||" \n"===a)&&!e,l="\n"===u&&!n,s=c&&!l||l&&!c,s&&(i=this.getSelectedRange())&&(o=c?a.replace(/\n$/,"").length||-1:1,null!=(r=this.responder)?r.positionIsBlockBreak(i[1]+o):void 0)?!0:e&&n)},d.prototype.mutationIsSignificant=function(t){var e,n,o;return o=Object.keys(t).length>0,e=""===(null!=(n=this.compositionInput)?n.getEndData():void 0),o||!e},d.prototype.attachFiles=function(t){var n,o;return o=function(){var o,i,r;for(r=[],o=0,i=t.length;i>o;o++)n=t[o],r.push(new e.FileVerificationOperation(n));return r}(),Promise.all(o).then(function(t){return function(e){return t.handleInput(function(){var t,n;return null!=(t=this.delegate)&&t.inputControllerWillAttachFiles(),null!=(n=this.responder)&&n.insertFiles(e),this.requestRender()})}}(this))},d.prototype.events={keydown:function(t){var n,o,i,r,a,u,c,l,h;if(this.isComposing()||this.resetInputSummary(),r=this.constructor.keyNames[t.keyCode]){for(o=this.keys,l=["ctrl","alt","shift","meta"],i=0,u=l.length;u>i;i++)c=l[i],t[c+"Key"]&&("ctrl"===c&&(c="control"),o=null!=o?o[c]:void 0);null!=(null!=o?o[r]:void 0)&&(this.setInputSummary({keyName:r}),e.selectionChangeObserver.reset(),o[r].call(this,t))}return s(t)&&(n=String.fromCharCode(t.keyCode).toLowerCase())&&(a=function(){var e,n,o,i;for(o=["alt","shift"],i=[],e=0,n=o.length;n>e;e++)c=o[e],t[c+"Key"]&&i.push(c);return i}(),a.push(n),null!=(h=this.delegate)?h.inputControllerDidReceiveKeyboardCommand(a):void 0)?t.preventDefault():void 0},keypress:function(t){var e,n,o;if(null==this.inputSummary.eventName&&(!t.metaKey&&!t.ctrlKey||t.altKey)&&!u(t)&&!a(t))return null===t.which?e=String.fromCharCode(t.keyCode):0!==t.which&&0!==t.charCode&&(e=String.fromCharCode(t.charCode)),null!=e?(null!=(n=this.delegate)&&n.inputControllerWillPerformTyping(),null!=(o=this.responder)&&o.insertString(e),this.setInputSummary({textAdded:e,didDelete:this.selectionIsExpanded()})):void 0},textInput:function(t){var e,n,o,i;return e=t.data,i=this.inputSummary.textAdded,i&&i!==e&&i.toUpperCase()===e?(n=this.getSelectedRange(),this.setSelectedRange([n[0],n[1]+i.length]),null!=(o=this.responder)&&o.insertString(e),this.setInputSummary({textAdded:e}),this.setSelectedRange(n)):void 0},dragenter:function(t){return t.preventDefault()},dragstart:function(t){var e,n;return n=t.target,this.serializeSelectionToDataTransfer(t.dataTransfer),this.draggedRange=this.getSelectedRange(),null!=(e=this.delegate)&&"function"==typeof e.inputControllerDidStartDrag?e.inputControllerDidStartDrag():void 0},dragover:function(t){var e,n;return!this.draggedRange&&!this.canAcceptDataTransfer(t.dataTransfer)||(t.preventDefault(),e={x:t.clientX,y:t.clientY},l(e,this.draggingPoint))?void 0:(this.draggingPoint=e,null!=(n=this.delegate)&&"function"==typeof n.inputControllerDidReceiveDragOverPoint?n.inputControllerDidReceiveDragOverPoint(this.draggingPoint):void 0)},dragend:function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.inputControllerDidCancelDrag&&t.inputControllerDidCancelDrag(),this.draggedRange=null,this.draggingPoint=null},drop:function(t){var n,o,i,r,s,a,u,c,l;return t.preventDefault(),i=null!=(s=t.dataTransfer)?s.files:void 0,r={x:t.clientX,y:t.clientY},null!=(a=this.responder)&&a.setLocationRangeFromPointRange(r),(null!=i?i.length:void 0)?this.attachFiles(i):this.draggedRange?(null!=(u=this.delegate)&&u.inputControllerWillMoveText(),null!=(c=this.responder)&&c.moveTextFromRange(this.draggedRange),this.draggedRange=null,this.requestRender()):(o=t.dataTransfer.getData("application/x-trix-document"))&&(n=e.Document.fromJSONString(o),null!=(l=this.responder)&&l.insertDocument(n),this.requestRender()),this.draggedRange=null,this.draggingPoint=null},cut:function(t){var e,n;return(null!=(e=this.responder)?e.selectionIsExpanded():void 0)&&(this.serializeSelectionToDataTransfer(t.clipboardData)&&t.preventDefault(),null!=(n=this.delegate)&&n.inputControllerWillCutText(),this.deleteInDirection("backward"),t.defaultPrevented)?this.requestRender():void 0},copy:function(t){var e;return(null!=(e=this.responder)?e.selectionIsExpanded():void 0)&&this.serializeSelectionToDataTransfer(t.clipboardData)?t.preventDefault():void 0},paste:function(n){var i,r,s,a,u,c,l,p,d,f,y,v,b,A,C,w,x,E,S,k,R,L;return u=null!=(l=n.clipboardData)?l:n.testClipboardData,c={paste:u},null==u||h(n)?void this.getPastedHTMLUsingHiddenElement(function(t){return function(e){var n,o,i;return c.html=e,null!=(n=t.delegate)&&n.inputControllerWillPasteText(c),null!=(o=t.responder)&&o.insertHTML(e),t.requestRender(),null!=(i=t.delegate)?i.inputControllerDidPaste(c):void 0}}(this)):((s=u.getData("URL"))?(L=u.getData("public.url-name")||s,c.string=L,this.setInputSummary({textAdded:L,didDelete:this.selectionIsExpanded()}),null!=(p=this.delegate)&&p.inputControllerWillPasteText(c),null!=(A=this.responder)&&A.insertText(e.Text.textForStringWithAttributes(L,{href:s})),this.requestRender(),null!=(C=this.delegate)&&C.inputControllerDidPaste(c)):t(u)?(L=u.getData("text/plain"),c.string=L,this.setInputSummary({textAdded:L,didDelete:this.selectionIsExpanded()}),null!=(w=this.delegate)&&w.inputControllerWillPasteText(c),null!=(x=this.responder)&&x.insertString(L),this.requestRender(),null!=(E=this.delegate)&&E.inputControllerDidPaste(c)):(a=u.getData("text/html"))?(c.html=a,null!=(S=this.delegate)&&S.inputControllerWillPasteText(c),null!=(k=this.responder)&&k.insertHTML(a),this.requestRender(),null!=(R=this.delegate)&&R.inputControllerDidPaste(c)):m.call(u.types,"Files")>=0&&(r=null!=(d=u.items)&&null!=(f=d[0])&&"function"==typeof f.getAsFile?f.getAsFile():void 0)&&(!r.name&&(i=o(r))&&(r.name="pasted-file-"+ ++g+"."+i),c.file=r,null!=(y=this.delegate)&&y.inputControllerWillAttachFiles(),null!=(v=this.responder)&&v.insertFile(r),this.requestRender(),null!=(b=this.delegate)&&b.inputControllerDidPaste(c)),n.preventDefault())},compositionstart:function(t){return this.getCompositionInput().start(t.data)},compositionupdate:function(t){return this.getCompositionInput().update(t.data)},compositionend:function(t){return this.getCompositionInput().end(t.data)},input:function(t){return t.stopPropagation()}},d.prototype.keys={backspace:function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("backward",t)},"delete":function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("forward",t)},"return":function(){var t,e;return this.setInputSummary({preferDocument:!0}),null!=(t=this.delegate)&&t.inputControllerWillPerformTyping(),null!=(e=this.responder)?e.insertLineBreak():void 0},tab:function(t){var e,n;return(null!=(e=this.responder)?e.canIncreaseNestingLevel():void 0)?(null!=(n=this.responder)&&n.increaseNestingLevel(),this.requestRender(),t.preventDefault()):void 0},left:function(t){var e;return this.selectionIsInCursorTarget()?(t.preventDefault(),null!=(e=this.responder)?e.moveCursorInDirection("backward"):void 0):void 0},right:function(t){var e;return this.selectionIsInCursorTarget()?(t.preventDefault(),null!=(e=this.responder)?e.moveCursorInDirection("forward"):void 0):void 0},control:{d:function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("forward",t)},h:function(t){var e;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),this.deleteInDirection("backward",t)},o:function(t){var e,n;return t.preventDefault(),null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),null!=(n=this.responder)&&n.insertString("\n",{updatePosition:!1}),this.requestRender()}},shift:{"return":function(t){var e,n;return null!=(e=this.delegate)&&e.inputControllerWillPerformTyping(),null!=(n=this.responder)&&n.insertString("\n"),this.requestRender(),t.preventDefault()},tab:function(t){var e,n;return(null!=(e=this.responder)?e.canDecreaseNestingLevel():void 0)?(null!=(n=this.responder)&&n.decreaseNestingLevel(),this.requestRender(),t.preventDefault()):void 0},left:function(t){return this.selectionIsInCursorTarget()?(t.preventDefault(),this.expandSelectionInDirection("backward")):void 0},right:function(t){return this.selectionIsInCursorTarget()?(t.preventDefault(),this.expandSelectionInDirection("forward")):void 0}},alt:{backspace:function(){var t;return this.setInputSummary({preferDocument:!1}),null!=(t=this.delegate)?t.inputControllerWillPerformTyping():void 0}},meta:{backspace:function(){var t;return this.setInputSummary({preferDocument:!1}),null!=(t=this.delegate)?t.inputControllerWillPerformTyping():void 0}}},d.prototype.handleInput=function(t){var e,n;try{return null!=(e=this.delegate)&&e.inputControllerWillHandleInput(),t.call(this)}finally{null!=(n=this.delegate)&&n.inputControllerDidHandleInput()}},d.prototype.getCompositionInput=function(){return this.isComposing()?this.compositionInput:this.compositionInput=new e.CompositionInput(this)},d.prototype.isComposing=function(){return null!=this.compositionInput&&!this.compositionInput.isEnded()},d.prototype.deleteInDirection=function(t,e){var n;return(null!=(n=this.responder)?n.deleteInDirection(t):void 0)!==!1?this.setInputSummary({didDelete:!0}):e?(e.preventDefault(),this.requestRender()):void 0},d.prototype.serializeSelectionToDataTransfer=function(t){var o,i;if(n(t))return o=null!=(i=this.responder)?i.getSelectedDocument().toSerializableDocument():void 0,t.setData("application/x-trix-document",JSON.stringify(o)),t.setData("text/html",e.DocumentView.render(o).innerHTML),t.setData("text/plain",o.toString().replace(/\n$/,"")),!0},d.prototype.canAcceptDataTransfer=function(t){var e,n,o,i,r,s;for(s={},i=null!=(o=null!=t?t.types:void 0)?o:[],e=0,n=i.length;n>e;e++)r=i[e],s[r]=!0;return s.Files||s["application/x-trix-document"]||s["text/html"]||s["text/plain"]},d.prototype.getPastedHTMLUsingHiddenElement=function(t){var e,n,o;return n=this.getSelectedRange(),o={position:"absolute",left:window.pageXOffset+"px",top:window.pageYOffset+"px",opacity:0},e=c({style:o,tagName:"div",editable:!0}),document.body.appendChild(e),e.focus(),requestAnimationFrame(function(o){return function(){var i;return i=e.innerHTML,document.body.removeChild(e),o.setSelectedRange(n),t(i)}}(this))},d.proxyMethod("responder?.getSelectedRange"),d.proxyMethod("responder?.setSelectedRange"),d.proxyMethod("responder?.expandSelectionInDirection"),d.proxyMethod("responder?.selectionIsInCursorTarget"),d.proxyMethod("responder?.selectionIsExpanded"),d
}(e.BasicObject),o=function(t){var e,n;return null!=(e=t.type)&&null!=(n=e.match(/\/(\w+)$/))?n[1]:void 0},u=function(t){return t.metaKey&&t.altKey&&!t.shiftKey&&94===t.keyCode},a=function(t){return t.metaKey&&t.altKey&&t.shiftKey&&9674===t.keyCode},s=function(t){return/Mac|^iP/.test(navigator.platform)?t.metaKey:t.ctrlKey},h=function(t){var e,n,o,i;return(i=t.clipboardData)?m.call(i.types,"text/html")>=0?o=i.types.some(function(t){var e,n;return e=/^CorePasteboardFlavorType/.test(t),n=/^dyn\./.test(t)&&i.getData(t),e||n}):(e=m.call(i.types,"com.apple.webarchive")>=0,n=m.call(i.types,"com.apple.flat-rtfd")>=0,e||n):void 0},t=function(t){var e,n,o;return o=t.getData("text/plain"),n=t.getData("text/html"),o&&n?(e=c("div"),e.innerHTML=n,e.textContent===o?!e.querySelector(":not(meta)"):void 0):null!=o?o.length:void 0},d={"application/x-trix-feature-detection":"test"},n=function(t){var e,n;if(null!=(null!=t?t.setData:void 0)){for(e in d)if(n=d[e],!function(){try{return t.setData(e,n),t.getData(e)===n}catch(o){}}())return;return!0}}}.call(this),function(){var t,n,o,i,r,s,a=function(t,e){return function(){return t.apply(e,arguments)}},u=function(t,e){function n(){this.constructor=t}for(var o in e)c.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},c={}.hasOwnProperty;n=e.handleEvent,r=e.makeElement,s=e.tagName,o=e.InputController.keyNames,i=e.config.lang,t=e.config.css.classNames,e.AttachmentEditorController=function(e){function c(t,e,n){this.attachmentPiece=t,this.element=e,this.container=n,this.didBlurCaption=a(this.didBlurCaption,this),this.didChangeCaption=a(this.didChangeCaption,this),this.didInputCaption=a(this.didInputCaption,this),this.didKeyDownCaption=a(this.didKeyDownCaption,this),this.didClickCaption=a(this.didClickCaption,this),this.didClickRemoveButton=a(this.didClickRemoveButton,this),this.attachment=this.attachmentPiece.attachment,"a"===s(this.element)&&(this.element=this.element.firstChild),this.install()}var l;return u(c,e),l=function(t){return function(){var e;return e=t.apply(this,arguments),e["do"](),null==this.undos&&(this.undos=[]),this.undos.push(e.undo)}},c.prototype.install=function(){return this.makeElementMutable(),this.attachment.isPreviewable()&&this.makeCaptionEditable(),this.addRemoveButton()},c.prototype.uninstall=function(){var t,e;for(this.savePendingCaption();e=this.undos.pop();)e();return null!=(t=this.delegate)?t.didUninstallAttachmentEditor(this):void 0},c.prototype.savePendingCaption=function(){var t,e,n;return null!=this.pendingCaption?(t=this.pendingCaption,this.pendingCaption=null,t?null!=(e=this.delegate)&&"function"==typeof e.attachmentEditorDidRequestUpdatingAttributesForAttachment?e.attachmentEditorDidRequestUpdatingAttributesForAttachment({caption:t},this.attachment):void 0:null!=(n=this.delegate)&&"function"==typeof n.attachmentEditorDidRequestRemovingAttributeForAttachment?n.attachmentEditorDidRequestRemovingAttributeForAttachment("caption",this.attachment):void 0):void 0},c.prototype.makeElementMutable=l(function(){return{"do":function(t){return function(){return t.element.dataset.trixMutable=!0}}(this),undo:function(t){return function(){return delete t.element.dataset.trixMutable}}(this)}}),c.prototype.makeCaptionEditable=l(function(){var t,e;return t=this.element.querySelector("figcaption"),e=null,{"do":function(o){return function(){return e=n("click",{onElement:t,withCallback:o.didClickCaption,inPhase:"capturing"})}}(this),undo:function(){return function(){return e.destroy()}}(this)}}),c.prototype.addRemoveButton=l(function(){var e;return e=r({tagName:"button",textContent:i.remove,className:t.attachment.removeButton,attributes:{type:"button",title:i.remove},data:{trixMutable:!0}}),n("click",{onElement:e,withCallback:this.didClickRemoveButton}),{"do":function(t){return function(){return t.element.appendChild(e)}}(this),undo:function(t){return function(){return t.element.removeChild(e)}}(this)}}),c.prototype.editCaption=l(function(){var e,o,s,a,u;return a=r({tagName:"textarea",className:t.attachment.captionEditor,attributes:{placeholder:i.captionPlaceholder}}),a.value=this.attachmentPiece.getCaption(),u=a.cloneNode(),u.classList.add("trix-autoresize-clone"),e=function(){return u.value=a.value,a.style.height=u.scrollHeight+"px"},n("keydown",{onElement:a,withCallback:this.didKeyDownCaption}),n("input",{onElement:a,withCallback:this.didInputCaption}),n("change",{onElement:a,withCallback:this.didChangeCaption}),n("blur",{onElement:a,withCallback:this.didBlurCaption}),s=this.element.querySelector("figcaption"),o=s.cloneNode(),{"do":function(){return s.style.display="none",o.appendChild(a),o.appendChild(u),o.classList.add(t.attachment.editingCaption),s.parentElement.insertBefore(o,s),e(),a.focus()},undo:function(){return o.parentNode.removeChild(o),s.style.display=null}}}),c.prototype.didClickRemoveButton=function(t){var e;return t.preventDefault(),t.stopPropagation(),null!=(e=this.delegate)?e.attachmentEditorDidRequestRemovalOfAttachment(this.attachment):void 0},c.prototype.didClickCaption=function(t){return t.preventDefault(),this.editCaption()},c.prototype.didKeyDownCaption=function(t){var e;return"return"===o[t.keyCode]?(t.preventDefault(),this.savePendingCaption(),null!=(e=this.delegate)&&"function"==typeof e.attachmentEditorDidRequestDeselectingAttachment?e.attachmentEditorDidRequestDeselectingAttachment(this.attachment):void 0):void 0},c.prototype.didInputCaption=function(t){return this.pendingCaption=t.target.value.replace(/\s/g," ").trim()},c.prototype.didChangeCaption=function(){return this.savePendingCaption()},c.prototype.didBlurCaption=function(){return this.savePendingCaption()},c}(e.BasicObject)}.call(this),function(){var t,n,o,i=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;o=e.makeElement,t=e.config.css.classNames,e.AttachmentView=function(r){function s(){s.__super__.constructor.apply(this,arguments),this.attachment=this.object,this.attachment.uploadProgressDelegate=this,this.attachmentPiece=this.options.piece}var a;return i(s,r),s.attachmentSelector="[data-trix-attachment]",s.prototype.createContentNodes=function(){return[]},s.prototype.createNodes=function(){var e,n,i,r,s,u,c,l,h,p,d;if(r=o({tagName:"figure",className:this.getClassName()}),this.attachment.hasContent())r.innerHTML=this.attachment.getContent();else for(p=this.createContentNodes(),u=0,l=p.length;l>u;u++)h=p[u],r.appendChild(h);r.appendChild(this.createCaptionElement()),n={trixAttachment:JSON.stringify(this.attachment),trixContentType:this.attachment.getContentType(),trixId:this.attachment.id},e=this.attachmentPiece.getAttributesForAttachment(),e.isEmpty()||(n.trixAttributes=JSON.stringify(e)),this.attachment.isPending()&&(this.progressElement=o({tagName:"progress",attributes:{"class":t.attachment.progressBar,value:this.attachment.getUploadProgress(),max:100},data:{trixMutable:!0,trixStoreKey:["progressElement",this.attachment.id].join("/")}}),r.appendChild(this.progressElement),n.trixSerialize=!1),(s=this.getHref())?(i=o("a",{href:s}),i.appendChild(r)):i=r;for(c in n)d=n[c],i.dataset[c]=d;return i.setAttribute("contenteditable",!1),[a("left"),i,a("right")]},s.prototype.createCaptionElement=function(){var e,n,i,r,s;return n=o({tagName:"figcaption",className:t.attachment.caption}),(e=this.attachmentPiece.getCaption())?(n.classList.add(t.attachment.captionEdited),n.textContent=e):(i=this.attachment.getFilename())&&(n.textContent=i,(r=this.attachment.getFormattedFilesize())&&(n.appendChild(document.createTextNode(" ")),s=o({tagName:"span",className:t.attachment.size,textContent:r}),n.appendChild(s))),n},s.prototype.getClassName=function(){var e,n;return n=[t.attachment.container,""+t.attachment.typePrefix+this.attachment.getType()],(e=this.attachment.getExtension())&&n.push(e),n.join(" ")},s.prototype.getHref=function(){return n(this.attachment.getContent(),"a")?void 0:this.attachment.getHref()},s.prototype.findProgressElement=function(){var t;return null!=(t=this.findElement())?t.querySelector("progress"):void 0},a=function(t){return o({tagName:"span",textContent:e.ZERO_WIDTH_SPACE,data:{trixCursorTarget:t,trixSerialize:!1}})},s.prototype.attachmentDidChangeUploadProgress=function(){var t,e;return e=this.attachment.getUploadProgress(),null!=(t=this.findProgressElement())?t.value=e:void 0},s}(e.ObjectView),n=function(t,e){var n;return n=o("div"),n.innerHTML=null!=t?t:"",n.querySelector(e)}}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty;t=e.makeElement,e.PreviewableAttachmentView=function(e){function o(){o.__super__.constructor.apply(this,arguments),this.attachment.previewDelegate=this}return n(o,e),o.prototype.createContentNodes=function(){return this.image=t({tagName:"img",attributes:{src:""},data:{trixMutable:!0}}),this.refresh(this.image),[this.image]},o.prototype.refresh=function(t){var e;return null==t&&(t=null!=(e=this.findElement())?e.querySelector("img"):void 0),t?this.updateAttributesForImage(t):void 0},o.prototype.updateAttributesForImage=function(t){var e,n,o,i,r,s;return r=this.attachment.getURL(),n=this.attachment.getPreviewURL(),t.src=n||r,n===r?t.removeAttribute("data-trix-serialized-attributes"):(o=JSON.stringify({src:r}),t.setAttribute("data-trix-serialized-attributes",o)),s=this.attachment.getWidth(),e=this.attachment.getHeight(),null!=s&&(t.width=s),null!=e&&(t.height=e),i=["imageElement",this.attachment.id,t.src,t.width,t.height].join("/"),t.dataset.trixStoreKey=i},o.prototype.attachmentDidChangeAttributes=function(){return this.refresh(this.image),this.refresh()},o}(e.AttachmentView)}.call(this),function(){var t,n,o,i=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;o=e.makeElement,t=e.findInnerElement,n=e.getTextConfig,e.PieceView=function(r){function s(){var t;s.__super__.constructor.apply(this,arguments),this.piece=this.object,this.attributes=this.piece.getAttributes(),t=this.options,this.textConfig=t.textConfig,this.context=t.context,this.piece.attachment?this.attachment=this.piece.attachment:this.string=this.piece.toString()}var a;return i(s,r),s.prototype.createNodes=function(){var e,n,o,i,r,s;if(s=this.attachment?this.createAttachmentNodes():this.createStringNodes(),e=this.createElement()){for(o=t(e),n=0,i=s.length;i>n;n++)r=s[n],o.appendChild(r);s=[e]}return s},s.prototype.createAttachmentNodes=function(){var t,n;return t=this.attachment.isPreviewable()?e.PreviewableAttachmentView:e.AttachmentView,n=this.createChildView(t,this.piece.attachment,{piece:this.piece}),n.getNodes()},s.prototype.createStringNodes=function(){var t,e,n,i,r,s,a,u,c,l;if(null!=(u=this.textConfig)?u.plaintext:void 0)return[document.createTextNode(this.string)];for(a=[],c=this.string.split("\n"),n=e=0,i=c.length;i>e;n=++e)l=c[n],n>0&&(t=o("br"),a.push(t)),(r=l.length)&&(s=document.createTextNode(this.preserveSpaces(l)),a.push(s));return a},s.prototype.createElement=function(){var t,e,i,r,s,a,u,c;for(r in this.attributes)if((t=n(r))&&(t.tagName&&(s=o(t.tagName),i?(i.appendChild(s),i=s):e=i=s),t.style))if(u){a=t.style;for(r in a)c=a[r],u[r]=c}else u=t.style;if(u){null==e&&(e=o("span"));for(r in u)c=u[r],e.style[r]=c}return e},s.prototype.createContainerElement=function(){var t,e,i,r,s;r=this.attributes;for(i in r)if(s=r[i],(e=n(i))&&e.groupTagName)return t={},t[i]=s,o(e.groupTagName,t)},a=e.NON_BREAKING_SPACE,s.prototype.preserveSpaces=function(t){return this.context.isLast&&(t=t.replace(/\ $/,a)),t=t.replace(/(\S)\ {3}(\S)/g,"$1 "+a+" $2").replace(/\ {2}/g,a+" ").replace(/\ {2}/g," "+a),(this.context.isFirst||this.context.followsWhitespace)&&(t=t.replace(/^\ /,a)),t},s}(e.ObjectView)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.TextView=function(n){function o(){o.__super__.constructor.apply(this,arguments),this.text=this.object,this.textConfig=this.options.textConfig}var i;return t(o,n),o.prototype.createNodes=function(){var t,n,o,r,s,a,u,c,l,h;for(a=[],c=e.ObjectGroup.groupObjects(this.getPieces()),r=c.length-1,o=n=0,s=c.length;s>n;o=++n)u=c[o],t={},0===o&&(t.isFirst=!0),o===r&&(t.isLast=!0),i(l)&&(t.followsWhitespace=!0),h=this.findOrCreateCachedChildView(e.PieceView,u,{textConfig:this.textConfig,context:t}),a.push.apply(a,h.getNodes()),l=u;return a},o.prototype.getPieces=function(){var t,e,n,o,i;for(o=this.text.getPieces(),i=[],t=0,e=o.length;e>t;t++)n=o[t],n.hasAttribute("blockBreak")||i.push(n);return i},i=function(t){return/\s$/.test(null!=t?t.toString():void 0)},o}(e.ObjectView)}.call(this),function(){var t,n,o=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty;n=e.makeElement,t=e.getBlockConfig,e.BlockView=function(i){function r(){r.__super__.constructor.apply(this,arguments),this.block=this.object,this.attributes=this.block.getAttributes()}return o(r,i),r.prototype.createNodes=function(){var o,i,r,s,a,u,c,l,h;if(o=document.createComment("block"),u=[o],this.block.isEmpty()?u.push(n("br")):(l=null!=(c=t(this.block.getLastAttribute()))?c.text:void 0,h=this.findOrCreateCachedChildView(e.TextView,this.block.text,{textConfig:l}),u.push.apply(u,h.getNodes()),this.shouldAddExtraNewlineElement()&&u.push(n("br"))),this.attributes.length)return u;for(i=n(e.config.blockAttributes["default"].tagName),r=0,s=u.length;s>r;r++)a=u[r],i.appendChild(a);return[i]},r.prototype.createContainerElement=function(e){var o,i;return o=this.attributes[e],i=t(o),n(i.tagName)},r.prototype.shouldAddExtraNewlineElement=function(){return/\n\n$/.test(this.block.toString())},r}(e.ObjectView)}.call(this),function(){var t,n,o=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty;t=e.defer,n=e.makeElement,e.DocumentView=function(i){function r(){r.__super__.constructor.apply(this,arguments),this.element=this.options.element,this.elementStore=new e.ElementStore,this.setDocument(this.object)}var s,a,u;return o(r,i),r.render=function(t){var e,o;return e=n("div"),o=new this(t,{element:e}),o.render(),o.sync(),e},r.prototype.setDocument=function(t){return t.isEqualTo(this.document)?void 0:this.document=this.object=t},r.prototype.render=function(){var t,o,i,r,s,a,u;if(this.childViews=[],this.shadowElement=n("div"),!this.document.isEmpty()){for(s=e.ObjectGroup.groupObjects(this.document.getBlocks(),{asTree:!0}),a=[],t=0,o=s.length;o>t;t++)r=s[t],u=this.findOrCreateCachedChildView(e.BlockView,r),a.push(function(){var t,e,n,o;for(n=u.getNodes(),o=[],t=0,e=n.length;e>t;t++)i=n[t],o.push(this.shadowElement.appendChild(i));return o}.call(this));return a}},r.prototype.isSynced=function(){return s(this.shadowElement,this.element)},r.prototype.sync=function(){var t;for(t=this.createDocumentFragmentForSync();this.element.lastChild;)this.element.removeChild(this.element.lastChild);return this.element.appendChild(t),this.didSync()},r.prototype.didSync=function(){return this.elementStore.reset(a(this.element)),t(function(t){return function(){return t.garbageCollectCachedViews()}}(this))},r.prototype.createDocumentFragmentForSync=function(){var t,e,n,o,i,r,s,u,c,l;for(e=document.createDocumentFragment(),u=this.shadowElement.childNodes,n=0,i=u.length;i>n;n++)s=u[n],e.appendChild(s.cloneNode(!0));for(c=a(e),o=0,r=c.length;r>o;o++)t=c[o],(l=this.elementStore.remove(t))&&t.parentNode.replaceChild(l,t);return e},a=function(t){return t.querySelectorAll("[data-trix-store-key]")},s=function(t,e){return u(t.innerHTML)===u(e.innerHTML)},u=function(t){return t.replace(/&nbsp;/g," ")},r}(e.ObjectView)}.call(this),function(){var t,n,o,i,r=function(t,e){return function(){return t.apply(e,arguments)}},s=function(t,e){function n(){this.constructor=t}for(var o in e)a.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},a={}.hasOwnProperty;o=e.handleEvent,i=e.innerElementIsActive,n=e.defer,t=e.AttachmentView.attachmentSelector,e.CompositionController=function(a){function u(n,i){this.element=n,this.composition=i,this.didClickAttachment=r(this.didClickAttachment,this),this.didBlur=r(this.didBlur,this),this.didFocus=r(this.didFocus,this),this.documentView=new e.DocumentView(this.composition.document,{element:this.element}),o("focus",{onElement:this.element,withCallback:this.didFocus}),o("blur",{onElement:this.element,withCallback:this.didBlur}),o("click",{onElement:this.element,matchingSelector:"a[contenteditable=false]",preventDefault:!0}),o("mousedown",{onElement:this.element,matchingSelector:t,withCallback:this.didClickAttachment}),o("click",{onElement:this.element,matchingSelector:"a"+t,preventDefault:!0})}return s(u,a),u.prototype.didFocus=function(){var t,e,n;return t=function(t){return function(){var e;return t.focused?void 0:(t.focused=!0,null!=(e=t.delegate)&&"function"==typeof e.compositionControllerDidFocus?e.compositionControllerDidFocus():void 0)}}(this),null!=(e=null!=(n=this.blurPromise)?n.then(t):void 0)?e:t()},u.prototype.didBlur=function(){return this.blurPromise=new Promise(function(t){return function(e){return n(function(){var n;return i(t.element)||(t.focused=null,null!=(n=t.delegate)&&"function"==typeof n.compositionControllerDidBlur&&n.compositionControllerDidBlur()),t.blurPromise=null,e()})}}(this))},u.prototype.didClickAttachment=function(t,e){var n,o;return n=this.findAttachmentForElement(e),null!=(o=this.delegate)&&"function"==typeof o.compositionControllerDidSelectAttachment?o.compositionControllerDidSelectAttachment(n):void 0},u.prototype.render=function(){var t,e,n;return this.revision!==this.composition.revision&&(this.documentView.setDocument(this.composition.document),this.documentView.render(),this.revision=this.composition.revision),this.documentView.isSynced()||(null!=(t=this.delegate)&&"function"==typeof t.compositionControllerWillSyncDocumentView&&t.compositionControllerWillSyncDocumentView(),this.documentView.sync(),this.reinstallAttachmentEditor(),null!=(e=this.delegate)&&"function"==typeof e.compositionControllerDidSyncDocumentView&&e.compositionControllerDidSyncDocumentView()),null!=(n=this.delegate)&&"function"==typeof n.compositionControllerDidRender?n.compositionControllerDidRender():void 0},u.prototype.rerenderViewForObject=function(t){return this.invalidateViewForObject(t),this.render()},u.prototype.invalidateViewForObject=function(t){return this.documentView.invalidateViewForObject(t)},u.prototype.isViewCachingEnabled=function(){return this.documentView.isViewCachingEnabled()},u.prototype.enableViewCaching=function(){return this.documentView.enableViewCaching()},u.prototype.disableViewCaching=function(){return this.documentView.disableViewCaching()},u.prototype.refreshViewCache=function(){return this.documentView.garbageCollectCachedViews()},u.prototype.installAttachmentEditorForAttachment=function(t){var n,o,i;if((null!=(i=this.attachmentEditor)?i.attachment:void 0)!==t&&(o=this.documentView.findElementForObject(t)))return this.uninstallAttachmentEditor(),n=this.composition.document.getAttachmentPieceForAttachment(t),this.attachmentEditor=new e.AttachmentEditorController(n,o,this.element),this.attachmentEditor.delegate=this},u.prototype.uninstallAttachmentEditor=function(){var t;return null!=(t=this.attachmentEditor)?t.uninstall():void 0},u.prototype.reinstallAttachmentEditor=function(){var t;return this.attachmentEditor?(t=this.attachmentEditor.attachment,this.uninstallAttachmentEditor(),this.installAttachmentEditorForAttachment(t)):void 0},u.prototype.editAttachmentCaption=function(){var t;return null!=(t=this.attachmentEditor)?t.editCaption():void 0},u.prototype.didUninstallAttachmentEditor=function(){return this.attachmentEditor=null,this.render()},u.prototype.attachmentEditorDidRequestUpdatingAttributesForAttachment=function(t,e){var n;return null!=(n=this.delegate)&&"function"==typeof n.compositionControllerWillUpdateAttachment&&n.compositionControllerWillUpdateAttachment(e),this.composition.updateAttributesForAttachment(t,e)},u.prototype.attachmentEditorDidRequestRemovingAttributeForAttachment=function(t,e){var n;return null!=(n=this.delegate)&&"function"==typeof n.compositionControllerWillUpdateAttachment&&n.compositionControllerWillUpdateAttachment(e),this.composition.removeAttributeForAttachment(t,e)},u.prototype.attachmentEditorDidRequestRemovalOfAttachment=function(t){var e;return null!=(e=this.delegate)&&"function"==typeof e.compositionControllerDidRequestRemovalOfAttachment?e.compositionControllerDidRequestRemovalOfAttachment(t):void 0},u.prototype.attachmentEditorDidRequestDeselectingAttachment=function(t){var e;return null!=(e=this.delegate)&&"function"==typeof e.compositionControllerDidRequestDeselectingAttachment?e.compositionControllerDidRequestDeselectingAttachment(t):void 0},u.prototype.findAttachmentForElement=function(t){return this.composition.document.getAttachmentById(parseInt(t.dataset.trixId,10))},u}(e.BasicObject)}.call(this),function(){var t,n,o,i=function(t,e){return function(){return t.apply(e,arguments)}},r=function(t,e){function n(){this.constructor=t}for(var o in e)s.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},s={}.hasOwnProperty;n=e.handleEvent,o=e.triggerEvent,t=e.findClosestElementFromNode,e.ToolbarController=function(e){function s(t){this.element=t,this.didKeyDownDialogInput=i(this.didKeyDownDialogInput,this),this.didClickDialogButton=i(this.didClickDialogButton,this),this.didClickAttributeButton=i(this.didClickAttributeButton,this),this.didClickActionButton=i(this.didClickActionButton,this),this.attributes={},this.actions={},this.resetDialogInputs(),n("mousedown",{onElement:this.element,matchingSelector:a,withCallback:this.didClickActionButton}),n("mousedown",{onElement:this.element,matchingSelector:c,withCallback:this.didClickAttributeButton}),n("click",{onElement:this.element,matchingSelector:y,preventDefault:!0}),n("click",{onElement:this.element,matchingSelector:l,withCallback:this.didClickDialogButton}),n("keydown",{onElement:this.element,matchingSelector:h,withCallback:this.didKeyDownDialogInput})}var a,u,c,l,h,p,d,f,g,m,y;return r(s,e),a="button[data-trix-action]",c="button[data-trix-attribute]",y=[a,c].join(", "),p=".dialog[data-trix-dialog]",u=p+".active",l=p+" input[data-trix-method]",h=p+" input[type=text], "+p+" input[type=url]",s.prototype.didClickActionButton=function(t,e){var n,o,i;return null!=(o=this.delegate)&&o.toolbarDidClickButton(),t.preventDefault(),n=d(e),this.getDialog(n)?this.toggleDialog(n):null!=(i=this.delegate)?i.toolbarDidInvokeAction(n):void 0},s.prototype.didClickAttributeButton=function(t,e){var n,o,i;return null!=(o=this.delegate)&&o.toolbarDidClickButton(),t.preventDefault(),n=f(e),this.getDialog(n)?this.toggleDialog(n):null!=(i=this.delegate)&&i.toolbarDidToggleAttribute(n),this.refreshAttributeButtons()},s.prototype.didClickDialogButton=function(e,n){var o,i;return o=t(n,{matchingSelector:p}),i=n.getAttribute("data-trix-method"),this[i].call(this,o)},s.prototype.didKeyDownDialogInput=function(t,e){var n,o;return 13===t.keyCode&&(t.preventDefault(),n=e.getAttribute("name"),o=this.getDialog(n),this.setAttribute(o)),27===t.keyCode?(t.preventDefault(),this.hideDialog()):void 0},s.prototype.updateActions=function(t){return this.actions=t,this.refreshActionButtons()},s.prototype.refreshActionButtons=function(){return this.eachActionButton(function(t){return function(e,n){return e.disabled=t.actions[n]===!1}}(this))},s.prototype.eachActionButton=function(t){var e,n,o,i,r;for(i=this.element.querySelectorAll(a),r=[],n=0,o=i.length;o>n;n++)e=i[n],r.push(t(e,d(e)));return r},s.prototype.updateAttributes=function(t){return this.attributes=t,this.refreshAttributeButtons()},s.prototype.refreshAttributeButtons=function(){return this.eachAttributeButton(function(t){return function(e,n){return e.disabled=t.attributes[n]===!1,t.attributes[n]||t.dialogIsVisible(n)?e.classList.add("active"):e.classList.remove("active")}}(this))},s.prototype.eachAttributeButton=function(t){var e,n,o,i,r;for(i=this.element.querySelectorAll(c),r=[],n=0,o=i.length;o>n;n++)e=i[n],r.push(t(e,f(e)));return r},s.prototype.applyKeyboardCommand=function(t){var e,n,i,r,s,a,u;for(s=JSON.stringify(t.sort()),u=this.element.querySelectorAll("[data-trix-key]"),r=0,a=u.length;a>r;r++)if(e=u[r],i=e.getAttribute("data-trix-key").split("+"),n=JSON.stringify(i.sort()),n===s)return o("mousedown",{onElement:e}),!0;return!1},s.prototype.dialogIsVisible=function(t){var e;return(e=this.getDialog(t))?e.classList.contains("active"):void 0},s.prototype.toggleDialog=function(t){return this.dialogIsVisible(t)?this.hideDialog():this.showDialog(t)},s.prototype.showDialog=function(t){var e,n,o,i,r,s,a,u,c,l;for(this.hideDialog(),null!=(a=this.delegate)&&a.toolbarWillShowDialog(),o=this.getDialog(t),o.classList.add("active"),u=o.querySelectorAll("input[disabled]"),i=0,s=u.length;s>i;i++)n=u[i],n.removeAttribute("disabled");return(e=f(o))&&(r=m(o,t))&&(r.value=null!=(c=this.attributes[e])?c:"",r.select()),null!=(l=this.delegate)?l.toolbarDidShowDialog(t):void 0},s.prototype.setAttribute=function(t){var e,n,o;return e=f(t),n=m(t,e),n.willValidate&&!n.checkValidity()?(n.classList.add("validate"),n.focus()):(null!=(o=this.delegate)&&o.toolbarDidUpdateAttribute(e,n.value),this.hideDialog())},s.prototype.removeAttribute=function(t){var e,n;return e=f(t),null!=(n=this.delegate)&&n.toolbarDidRemoveAttribute(e),this.hideDialog()},s.prototype.hideDialog=function(){var t,e;return(t=this.element.querySelector(u))?(t.classList.remove("active"),this.resetDialogInputs(),null!=(e=this.delegate)?e.toolbarDidHideDialog(g(t)):void 0):void 0},s.prototype.resetDialogInputs=function(){var t,e,n,o,i;for(o=this.element.querySelectorAll(h),i=[],t=0,n=o.length;n>t;t++)e=o[t],e.setAttribute("disabled","disabled"),i.push(e.classList.remove("validate"));return i},s.prototype.getDialog=function(t){return this.element.querySelector(".dialog[data-trix-dialog="+t+"]")},m=function(t,e){return null==e&&(e=f(t)),t.querySelector("input[name='"+e+"']")},d=function(t){return t.getAttribute("data-trix-action")},f=function(t){return t.getAttribute("data-trix-attribute")},g=function(t){return t.getAttribute("data-trix-dialog")},s}(e.BasicObject)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ImagePreloadOperation=function(e){function n(t){this.url=t}return t(n,e),n.prototype.perform=function(t){var e;return e=new Image,e.onload=function(n){return function(){return e.width=n.width=e.naturalWidth,e.height=n.height=e.naturalHeight,t(!0,e)}}(this),e.onerror=function(){return t(!1)},e.src=this.url},n}(e.Operation)}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}},n=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty;e.Attachment=function(o){function i(n){null==n&&(n={}),this.releaseFile=t(this.releaseFile,this),i.__super__.constructor.apply(this,arguments),this.attributes=e.Hash.box(n),this.didChangeAttributes()}return n(i,o),i.previewablePattern=/^image(\/(gif|png|jpe?g)|$)/,i.attachmentForFile=function(t){var e,n;return n=this.attributesForFile(t),e=new this(n),e.setFile(t),e},i.attributesForFile=function(t){return new e.Hash({filename:t.name,filesize:t.size,contentType:t.type})},i.fromJSON=function(t){return new this(t)},i.prototype.getAttribute=function(t){return this.attributes.get(t)},i.prototype.hasAttribute=function(t){return this.attributes.has(t)},i.prototype.getAttributes=function(){return this.attributes.toObject()},i.prototype.setAttributes=function(t){var e,n,o;return null==t&&(t={}),e=this.attributes.merge(t),this.attributes.isEqualTo(e)?void 0:(this.attributes=e,this.didChangeAttributes(),null!=(n=this.previewDelegate)&&"function"==typeof n.attachmentDidChangeAttributes&&n.attachmentDidChangeAttributes(this),null!=(o=this.delegate)&&"function"==typeof o.attachmentDidChangeAttributes?o.attachmentDidChangeAttributes(this):void 0)},i.prototype.didChangeAttributes=function(){return this.isPreviewable()?this.preloadURL():void 0},i.prototype.isPending=function(){return null!=this.file&&!(this.getURL()||this.getHref())},i.prototype.isPreviewable=function(){return this.attributes.has("previewable")?this.attributes.get("previewable"):this.constructor.previewablePattern.test(this.getContentType())},i.prototype.getType=function(){return this.hasContent()?"content":this.isPreviewable()?"preview":"file"},i.prototype.getURL=function(){return this.attributes.get("url")},i.prototype.getHref=function(){return this.attributes.get("href")},i.prototype.getFilename=function(){var t;return null!=(t=this.attributes.get("filename"))?t:""},i.prototype.getFilesize=function(){return this.attributes.get("filesize")},i.prototype.getFormattedFilesize=function(){var t;return t=this.attributes.get("filesize"),"number"==typeof t?e.config.fileSize.formatter(t):""},i.prototype.getExtension=function(){var t;return null!=(t=this.getFilename().match(/\.(\w+)$/))?t[1].toLowerCase():void 0},i.prototype.getContentType=function(){return this.attributes.get("contentType")},i.prototype.hasContent=function(){return this.attributes.has("content")},i.prototype.getContent=function(){return this.attributes.get("content")},i.prototype.getWidth=function(){return this.attributes.get("width")},i.prototype.getHeight=function(){return this.attributes.get("height")},i.prototype.getFile=function(){return this.file},i.prototype.setFile=function(t){return this.file=t,this.isPreviewable()?this.preloadFile():void 0},i.prototype.releaseFile=function(){return this.releasePreloadedFile(),this.file=null},i.prototype.getUploadProgress=function(){var t;return null!=(t=this.uploadProgress)?t:0},i.prototype.setUploadProgress=function(t){var e;return this.uploadProgress!==t?(this.uploadProgress=t,null!=(e=this.uploadProgressDelegate)&&"function"==typeof e.attachmentDidChangeUploadProgress?e.attachmentDidChangeUploadProgress(this):void 0):void 0},i.prototype.toJSON=function(){return this.getAttributes()},i.prototype.getCacheKey=function(){return[i.__super__.getCacheKey.apply(this,arguments),this.attributes.getCacheKey(),this.getPreviewURL()].join("/")},i.prototype.getPreviewURL=function(){return this.previewURL||this.preloadingURL},i.prototype.setPreviewURL=function(t){var e,n;return t!==this.getPreviewURL()?(this.previewURL=t,null!=(e=this.previewDelegate)&&"function"==typeof e.attachmentDidChangeAttributes&&e.attachmentDidChangeAttributes(this),null!=(n=this.delegate)&&"function"==typeof n.attachmentDidChangePreviewURL?n.attachmentDidChangePreviewURL(this):void 0):void 0},i.prototype.preloadURL=function(){return this.preload(this.getURL(),this.releaseFile)},i.prototype.preloadFile=function(){return this.file?(this.fileObjectURL=URL.createObjectURL(this.file),this.preload(this.fileObjectURL)):void 0},i.prototype.releasePreloadedFile=function(){return this.fileObjectURL?(URL.revokeObjectURL(this.fileObjectURL),this.fileObjectURL=null):void 0},i.prototype.preload=function(t,n){var o;return t&&t!==this.getPreviewURL()?(this.preloadingURL=t,o=new e.ImagePreloadOperation(t),o.then(function(e){return function(o){var i,r;return r=o.width,i=o.height,e.setAttributes({width:r,height:i}),e.preloadingURL=null,e.setPreviewURL(t),"function"==typeof n?n():void 0}}(this))):void 0},i}(e.Object)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Piece=function(n){function o(t,n){null==n&&(n={}),o.__super__.constructor.apply(this,arguments),this.attributes=e.Hash.box(n)}return t(o,n),o.types={},o.registerType=function(t,e){return e.type=t,this.types[t]=e},o.fromJSON=function(t){var e;return(e=this.types[t.type])?e.fromJSON(t):void 0},o.prototype.copyWithAttributes=function(t){return new this.constructor(this.getValue(),t)},o.prototype.copyWithAdditionalAttributes=function(t){return this.copyWithAttributes(this.attributes.merge(t))
},o.prototype.copyWithoutAttribute=function(t){return this.copyWithAttributes(this.attributes.remove(t))},o.prototype.copy=function(){return this.copyWithAttributes(this.attributes)},o.prototype.getAttribute=function(t){return this.attributes.get(t)},o.prototype.getAttributesHash=function(){return this.attributes},o.prototype.getAttributes=function(){return this.attributes.toObject()},o.prototype.getCommonAttributes=function(){var t,e,n;return(n=pieceList.getPieceAtIndex(0))?(t=n.attributes,e=t.getKeys(),pieceList.eachPiece(function(n){return e=t.getKeysCommonToHash(n.attributes),t=t.slice(e)}),t.toObject()):{}},o.prototype.hasAttribute=function(t){return this.attributes.has(t)},o.prototype.hasSameStringValueAsPiece=function(t){return null!=t&&this.toString()===t.toString()},o.prototype.hasSameAttributesAsPiece=function(t){return null!=t&&(this.attributes===t.attributes||this.attributes.isEqualTo(t.attributes))},o.prototype.isBlockBreak=function(){return!1},o.prototype.isEqualTo=function(t){return o.__super__.isEqualTo.apply(this,arguments)||this.hasSameConstructorAs(t)&&this.hasSameStringValueAsPiece(t)&&this.hasSameAttributesAsPiece(t)},o.prototype.isEmpty=function(){return 0===this.length},o.prototype.isSerializable=function(){return!0},o.prototype.toJSON=function(){return{type:this.constructor.type,attributes:this.getAttributes()}},o.prototype.contentsForInspection=function(){return{type:this.constructor.type,attributes:this.attributes.inspect()}},o.prototype.canBeGrouped=function(){return this.hasAttribute("href")},o.prototype.canBeGroupedWith=function(t){return this.getAttribute("href")===t.getAttribute("href")},o.prototype.getLength=function(){return this.length},o.prototype.canBeConsolidatedWith=function(){return!1},o}(e.Object)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Piece.registerType("attachment",e.AttachmentPiece=function(n){function o(t){this.attachment=t,o.__super__.constructor.apply(this,arguments),this.length=1,this.ensureAttachmentExclusivelyHasAttribute("href")}return t(o,n),o.fromJSON=function(t){return new this(e.Attachment.fromJSON(t.attachment),t.attributes)},o.prototype.ensureAttachmentExclusivelyHasAttribute=function(t){return this.hasAttribute(t)&&this.attachment.hasAttribute(t)?this.attributes=this.attributes.remove(t):void 0},o.prototype.getValue=function(){return this.attachment},o.prototype.isSerializable=function(){return!this.attachment.isPending()},o.prototype.getCaption=function(){var t;return null!=(t=this.attributes.get("caption"))?t:""},o.prototype.getAttributesForAttachment=function(){return this.attributes.slice(["caption"])},o.prototype.canBeGrouped=function(){return o.__super__.canBeGrouped.apply(this,arguments)&&!this.attachment.hasAttribute("href")},o.prototype.isEqualTo=function(t){var e;return o.__super__.isEqualTo.apply(this,arguments)&&this.attachment.id===(null!=t&&null!=(e=t.attachment)?e.id:void 0)},o.prototype.toString=function(){return e.OBJECT_REPLACEMENT_CHARACTER},o.prototype.toJSON=function(){var t;return t=o.__super__.toJSON.apply(this,arguments),t.attachment=this.attachment,t},o.prototype.getCacheKey=function(){return[o.__super__.getCacheKey.apply(this,arguments),this.attachment.getCacheKey()].join("/")},o.prototype.toConsole=function(){return JSON.stringify(this.toString())},o}(e.Piece))}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty;t=e.normalizeNewlines,e.Piece.registerType("string",e.StringPiece=function(e){function o(e){o.__super__.constructor.apply(this,arguments),this.string=t(e),this.length=this.string.length}return n(o,e),o.fromJSON=function(t){return new this(t.string,t.attributes)},o.prototype.getValue=function(){return this.string},o.prototype.toString=function(){return this.string.toString()},o.prototype.isBlockBreak=function(){return"\n"===this.toString()&&this.getAttribute("blockBreak")===!0},o.prototype.toJSON=function(){var t;return t=o.__super__.toJSON.apply(this,arguments),t.string=this.string,t},o.prototype.canBeConsolidatedWith=function(t){return null!=t&&this.hasSameConstructorAs(t)&&this.hasSameAttributesAsPiece(t)},o.prototype.consolidateWith=function(t){return new this.constructor(this.toString()+t.toString(),this.attributes)},o.prototype.splitAtOffset=function(t){var e,n;return 0===t?(e=null,n=this):t===this.length?(e=this,n=null):(e=new this.constructor(this.string.slice(0,t),this.attributes),n=new this.constructor(this.string.slice(t),this.attributes)),[e,n]},o.prototype.toConsole=function(){var t;return t=this.string,t.length>15&&(t=t.slice(0,14)+"\u2026"),JSON.stringify(t.toString())},o}(e.Piece))}.call(this),function(){var t,n=function(t,e){function n(){this.constructor=t}for(var i in e)o.call(e,i)&&(t[i]=e[i]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},o={}.hasOwnProperty,i=[].slice;t=e.spliceArray,e.SplittableList=function(e){function o(t){null==t&&(t=[]),o.__super__.constructor.apply(this,arguments),this.objects=t.slice(0),this.length=this.objects.length}var r,s,a;return n(o,e),o.box=function(t){return t instanceof this?t:new this(t)},o.prototype.indexOf=function(t){return this.objects.indexOf(t)},o.prototype.splice=function(){var e;return e=1<=arguments.length?i.call(arguments,0):[],new this.constructor(t.apply(null,[this.objects].concat(i.call(e))))},o.prototype.eachObject=function(t){var e,n,o,i,r,s;for(r=this.objects,s=[],n=e=0,o=r.length;o>e;n=++e)i=r[n],s.push(t(i,n));return s},o.prototype.insertObjectAtIndex=function(t,e){return this.splice(e,0,t)},o.prototype.insertSplittableListAtIndex=function(t,e){return this.splice.apply(this,[e,0].concat(i.call(t.objects)))},o.prototype.insertSplittableListAtPosition=function(t,e){var n,o,i;return i=this.splitObjectAtPosition(e),o=i[0],n=i[1],new this.constructor(o).insertSplittableListAtIndex(t,n)},o.prototype.editObjectAtIndex=function(t,e){return this.replaceObjectAtIndex(e(this.objects[t]),t)},o.prototype.replaceObjectAtIndex=function(t,e){return this.splice(e,1,t)},o.prototype.removeObjectAtIndex=function(t){return this.splice(t,1)},o.prototype.getObjectAtIndex=function(t){return this.objects[t]},o.prototype.getSplittableListInRange=function(t){var e,n,o,i;return o=this.splitObjectsAtRange(t),n=o[0],e=o[1],i=o[2],new this.constructor(n.slice(e,i+1))},o.prototype.selectSplittableList=function(t){var e,n;return n=function(){var n,o,i,r;for(i=this.objects,r=[],n=0,o=i.length;o>n;n++)e=i[n],t(e)&&r.push(e);return r}.call(this),new this.constructor(n)},o.prototype.removeObjectsInRange=function(t){var e,n,o,i;return o=this.splitObjectsAtRange(t),n=o[0],e=o[1],i=o[2],new this.constructor(n).splice(e,i-e+1)},o.prototype.transformObjectsInRange=function(t,e){var n,o,i,r,s,a,u;return s=this.splitObjectsAtRange(t),r=s[0],o=s[1],a=s[2],u=function(){var t,s,u;for(u=[],n=t=0,s=r.length;s>t;n=++t)i=r[n],u.push(n>=o&&a>=n?e(i):i);return u}(),new this.constructor(u)},o.prototype.splitObjectsAtRange=function(t){var e,n,o,i,s,u;return i=this.splitObjectAtPosition(a(t)),n=i[0],e=i[1],o=i[2],s=new this.constructor(n).splitObjectAtPosition(r(t)+o),n=s[0],u=s[1],[n,e,u-1]},o.prototype.getObjectAtPosition=function(t){var e,n,o;return o=this.findIndexAndOffsetAtPosition(t),e=o.index,n=o.offset,this.objects[e]},o.prototype.splitObjectAtPosition=function(t){var e,n,o,i,r,s,a,u,c,l;return s=this.findIndexAndOffsetAtPosition(t),e=s.index,r=s.offset,i=this.objects.slice(0),null!=e?0===r?(c=e,l=0):(o=this.getObjectAtIndex(e),a=o.splitAtOffset(r),n=a[0],u=a[1],i.splice(e,1,n,u),c=e+1,l=n.getLength()-r):(c=i.length,l=0),[i,c,l]},o.prototype.consolidate=function(){var t,e,n,o,i,r;for(o=[],i=this.objects[0],r=this.objects.slice(1),t=0,e=r.length;e>t;t++)n=r[t],("function"==typeof i.canBeConsolidatedWith?i.canBeConsolidatedWith(n):void 0)?i=i.consolidateWith(n):(o.push(i),i=n);return null!=i&&o.push(i),new this.constructor(o)},o.prototype.consolidateFromIndexToIndex=function(t,e){var n,o,r;return o=this.objects.slice(0),r=o.slice(t,e+1),n=new this.constructor(r).consolidate().toArray(),this.splice.apply(this,[t,r.length].concat(i.call(n)))},o.prototype.findIndexAndOffsetAtPosition=function(t){var e,n,o,i,r,s,a;for(e=0,a=this.objects,o=n=0,i=a.length;i>n;o=++n){if(s=a[o],r=e+s.getLength(),t>=e&&r>t)return{index:o,offset:t-e};e=r}return{index:null,offset:null}},o.prototype.findPositionAtIndexAndOffset=function(t,e){var n,o,i,r,s,a;for(s=0,a=this.objects,n=o=0,i=a.length;i>o;n=++o)if(r=a[n],t>n)s+=r.getLength();else if(n===t){s+=e;break}return s},o.prototype.getEndPosition=function(){var t,e;return null!=this.endPosition?this.endPosition:this.endPosition=function(){var n,o,i;for(e=0,i=this.objects,n=0,o=i.length;o>n;n++)t=i[n],e+=t.getLength();return e}.call(this)},o.prototype.toString=function(){return this.objects.join("")},o.prototype.toArray=function(){return this.objects.slice(0)},o.prototype.toJSON=function(){return this.toArray()},o.prototype.isEqualTo=function(t){return o.__super__.isEqualTo.apply(this,arguments)||s(this.objects,null!=t?t.objects:void 0)},s=function(t,e){var n,o,i,r,s;if(null==e&&(e=[]),t.length!==e.length)return!1;for(s=!0,o=n=0,i=t.length;i>n;o=++n)r=t[o],s&&!r.isEqualTo(e[o])&&(s=!1);return s},o.prototype.contentsForInspection=function(){var t;return{objects:"["+function(){var e,n,o,i;for(o=this.objects,i=[],e=0,n=o.length;n>e;e++)t=o[e],i.push(t.inspect());return i}.call(this).join(", ")+"]"}},a=function(t){return t[0]},r=function(t){return t[1]},o}(e.Object)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.Text=function(n){function o(t){var n;null==t&&(t=[]),o.__super__.constructor.apply(this,arguments),this.pieceList=new e.SplittableList(function(){var e,o,i;for(i=[],e=0,o=t.length;o>e;e++)n=t[e],n.isEmpty()||i.push(n);return i}())}return t(o,n),o.textForAttachmentWithAttributes=function(t,n){var o;return o=new e.AttachmentPiece(t,n),new this([o])},o.textForStringWithAttributes=function(t,n){var o;return o=new e.StringPiece(t,n),new this([o])},o.fromJSON=function(t){var n,o;return o=function(){var o,i,r;for(r=[],o=0,i=t.length;i>o;o++)n=t[o],r.push(e.Piece.fromJSON(n));return r}(),new this(o)},o.prototype.copy=function(){return this.copyWithPieceList(this.pieceList)},o.prototype.copyWithPieceList=function(t){return new this.constructor(t.consolidate().toArray())},o.prototype.copyUsingObjectMap=function(t){var e,n;return n=function(){var n,o,i,r,s;for(i=this.getPieces(),s=[],n=0,o=i.length;o>n;n++)e=i[n],s.push(null!=(r=t.find(e))?r:e);return s}.call(this),new this.constructor(n)},o.prototype.appendText=function(t){return this.insertTextAtPosition(t,this.getLength())},o.prototype.insertTextAtPosition=function(t,e){return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(t.pieceList,e))},o.prototype.removeTextAtRange=function(t){return this.copyWithPieceList(this.pieceList.removeObjectsInRange(t))},o.prototype.replaceTextAtRange=function(t,e){return this.removeTextAtRange(e).insertTextAtPosition(t,e[0])},o.prototype.moveTextFromRangeToPosition=function(t,e){var n,o;if(!(t[0]<=e&&e<=t[1]))return o=this.getTextAtRange(t),n=o.getLength(),t[0]<e&&(e-=n),this.removeTextAtRange(t).insertTextAtPosition(o,e)},o.prototype.addAttributeAtRange=function(t,e,n){var o;return o={},o[t]=e,this.addAttributesAtRange(o,n)},o.prototype.addAttributesAtRange=function(t,e){return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e,function(e){return e.copyWithAdditionalAttributes(t)}))},o.prototype.removeAttributeAtRange=function(t,e){return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e,function(e){return e.copyWithoutAttribute(t)}))},o.prototype.setAttributesAtRange=function(t,e){return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e,function(e){return e.copyWithAttributes(t)}))},o.prototype.getAttributesAtPosition=function(t){var e,n;return null!=(e=null!=(n=this.pieceList.getObjectAtPosition(t))?n.getAttributes():void 0)?e:{}},o.prototype.getCommonAttributes=function(){var t,n;return t=function(){var t,e,o,i;for(o=this.pieceList.toArray(),i=[],t=0,e=o.length;e>t;t++)n=o[t],i.push(n.getAttributes());return i}.call(this),e.Hash.fromCommonAttributesOfObjects(t).toObject()},o.prototype.getCommonAttributesAtRange=function(t){var e;return null!=(e=this.getTextAtRange(t).getCommonAttributes())?e:{}},o.prototype.getExpandedRangeForAttributeAtOffset=function(t,e){var n,o,i;for(n=i=e,o=this.getLength();n>0&&this.getCommonAttributesAtRange([n-1,i])[t];)n--;for(;o>i&&this.getCommonAttributesAtRange([e,i+1])[t];)i++;return[n,i]},o.prototype.getTextAtRange=function(t){return this.copyWithPieceList(this.pieceList.getSplittableListInRange(t))},o.prototype.getStringAtRange=function(t){return this.pieceList.getSplittableListInRange(t).toString()},o.prototype.getStringAtPosition=function(t){return this.getStringAtRange([t,t+1])},o.prototype.startsWithString=function(t){return this.getStringAtRange([0,t.length])===t},o.prototype.endsWithString=function(t){var e;return e=this.getLength(),this.getStringAtRange([e-t.length,e])===t},o.prototype.getAttachmentPieces=function(){var t,e,n,o,i;for(o=this.pieceList.toArray(),i=[],t=0,e=o.length;e>t;t++)n=o[t],null!=n.attachment&&i.push(n);return i},o.prototype.getAttachments=function(){var t,e,n,o,i;for(o=this.getAttachmentPieces(),i=[],t=0,e=o.length;e>t;t++)n=o[t],i.push(n.attachment);return i},o.prototype.getAttachmentAndPositionById=function(t){var e,n,o,i,r,s;for(i=0,r=this.pieceList.toArray(),e=0,n=r.length;n>e;e++){if(o=r[e],(null!=(s=o.attachment)?s.id:void 0)===t)return{attachment:o.attachment,position:i};i+=o.length}return{attachment:null,position:null}},o.prototype.getAttachmentById=function(t){var e,n,o;return o=this.getAttachmentAndPositionById(t),e=o.attachment,n=o.position,e},o.prototype.getRangeOfAttachment=function(t){var e,n;return n=this.getAttachmentAndPositionById(t.id),t=n.attachment,e=n.position,null!=t?[e,e+1]:void 0},o.prototype.updateAttributesForAttachment=function(t,e){var n;return(n=this.getRangeOfAttachment(e))?this.addAttributesAtRange(t,n):this},o.prototype.getLength=function(){return this.pieceList.getEndPosition()},o.prototype.isEmpty=function(){return 0===this.getLength()},o.prototype.isEqualTo=function(t){var e;return o.__super__.isEqualTo.apply(this,arguments)||(null!=t&&null!=(e=t.pieceList)?e.isEqualTo(this.pieceList):void 0)},o.prototype.isBlockBreak=function(){return 1===this.getLength()&&this.pieceList.getObjectAtIndex(0).isBlockBreak()},o.prototype.eachPiece=function(t){return this.pieceList.eachObject(t)},o.prototype.getPieces=function(){return this.pieceList.toArray()},o.prototype.getPieceAtPosition=function(t){return this.pieceList.getObjectAtPosition(t)},o.prototype.contentsForInspection=function(){return{pieceList:this.pieceList.inspect()}},o.prototype.toSerializableText=function(){var t;return t=this.pieceList.selectSplittableList(function(t){return t.isSerializable()}),this.copyWithPieceList(t)},o.prototype.toString=function(){return this.pieceList.toString()},o.prototype.toJSON=function(){return this.pieceList.toJSON()},o.prototype.toConsole=function(){var t;return JSON.stringify(function(){var e,n,o,i;for(o=this.pieceList.toArray(),i=[],e=0,n=o.length;n>e;e++)t=o[e],i.push(JSON.parse(t.toConsole()));return i}.call(this))},o}(e.Object)}.call(this),function(){var t,n,o,i,r,s=function(t,e){function n(){this.constructor=t}for(var o in e)a.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},a={}.hasOwnProperty,u=[].slice,c=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.arraysAreEqual,r=e.spliceArray,o=e.getBlockConfig,n=e.getBlockAttributeNames,i=e.getListAttributeNames,e.Block=function(n){function a(t,n){null==t&&(t=new e.Text),null==n&&(n=[]),a.__super__.constructor.apply(this,arguments),this.text=h(t),this.attributes=n}var l,h,p,d,f,g,m,y,v;return s(a,n),a.fromJSON=function(t){var n;return n=e.Text.fromJSON(t.text),new this(n,t.attributes)},a.prototype.isEmpty=function(){return this.text.isBlockBreak()},a.prototype.isEqualTo=function(e){return a.__super__.isEqualTo.apply(this,arguments)||this.text.isEqualTo(null!=e?e.text:void 0)&&t(this.attributes,null!=e?e.attributes:void 0)},a.prototype.copyWithText=function(t){return new this.constructor(t,this.attributes)},a.prototype.copyWithoutText=function(){return this.copyWithText(null)},a.prototype.copyWithAttributes=function(t){return new this.constructor(this.text,t)},a.prototype.copyUsingObjectMap=function(t){var e;return this.copyWithText((e=t.find(this.text))?e:this.text.copyUsingObjectMap(t))},a.prototype.addAttribute=function(t){var e;return e=this.attributes.concat(d(t)),this.copyWithAttributes(e)},a.prototype.removeAttribute=function(t){var e,n;return n=o(t).listAttribute,e=g(g(this.attributes,t),n),this.copyWithAttributes(e)},a.prototype.removeLastAttribute=function(){return this.removeAttribute(this.getLastAttribute())},a.prototype.getLastAttribute=function(){return f(this.attributes)},a.prototype.getAttributes=function(){return this.attributes.slice(0)},a.prototype.getAttributeLevel=function(){return this.attributes.length},a.prototype.getAttributeAtLevel=function(t){return this.attributes[t-1]},a.prototype.hasAttributes=function(){return this.getAttributeLevel()>0},a.prototype.getLastNestableAttribute=function(){return f(this.getNestableAttributes())},a.prototype.getNestableAttributes=function(){var t,e,n,i,r;for(i=this.attributes,r=[],e=0,n=i.length;n>e;e++)t=i[e],o(t).nestable&&r.push(t);return r},a.prototype.getNestingLevel=function(){return this.getNestableAttributes().length},a.prototype.decreaseNestingLevel=function(){var t;return(t=this.getLastNestableAttribute())?this.removeAttribute(t):this},a.prototype.increaseNestingLevel=function(){var t,e,n;return(t=this.getLastNestableAttribute())?(n=this.attributes.lastIndexOf(t),e=r.apply(null,[this.attributes,n+1,0].concat(u.call(d(t)))),this.copyWithAttributes(e)):this},a.prototype.getListItemAttributes=function(){var t,e,n,i,r;for(i=this.attributes,r=[],e=0,n=i.length;n>e;e++)t=i[e],o(t).listAttribute&&r.push(t);return r},a.prototype.isListItem=function(){var t;return null!=(t=o(this.getLastAttribute()))?t.listAttribute:void 0},a.prototype.isTerminalBlock=function(){var t;return null!=(t=o(this.getLastAttribute()))?t.terminal:void 0},a.prototype.breaksOnReturn=function(){var t;return null!=(t=o(this.getLastAttribute()))?t.breakOnReturn:void 0},a.prototype.findLineBreakInDirectionFromPosition=function(t,e){var n,o;return o=this.toString(),n=function(){switch(t){case"forward":return o.indexOf("\n",e);case"backward":return o.slice(0,e).lastIndexOf("\n")}}(),-1!==n?n:void 0},a.prototype.contentsForInspection=function(){return{text:this.text.inspect(),attributes:this.attributes}},a.prototype.toString=function(){return this.text.toString()},a.prototype.toJSON=function(){return{text:this.text,attributes:this.attributes}},a.prototype.getLength=function(){return this.text.getLength()},a.prototype.canBeConsolidatedWith=function(t){return!this.hasAttributes()&&!t.hasAttributes()},a.prototype.consolidateWith=function(t){var n,o;return n=e.Text.textForStringWithAttributes("\n"),o=this.getTextWithoutBlockBreak().appendText(n),this.copyWithText(o.appendText(t.text))},a.prototype.splitAtOffset=function(t){var e,n;return 0===t?(e=null,n=this):t===this.getLength()?(e=this,n=null):(e=this.copyWithText(this.text.getTextAtRange([0,t])),n=this.copyWithText(this.text.getTextAtRange([t,this.getLength()]))),[e,n]},a.prototype.getBlockBreakPosition=function(){return this.text.getLength()-1},a.prototype.getTextWithoutBlockBreak=function(){return m(this.text)?this.text.getTextAtRange([0,this.getBlockBreakPosition()]):this.text.copy()},a.prototype.canBeGrouped=function(t){return this.attributes[t]},a.prototype.canBeGroupedWith=function(t,e){var n,r,s,a;return s=t.getAttributes(),r=s[e],n=this.attributes[e],n===r&&!(o(n).group===!1&&(a=s[e+1],c.call(i(),a)<0))},h=function(t){return t=v(t),t=l(t)},v=function(t){var n,o,i,r,s,a;return r=!1,a=t.getPieces(),o=2<=a.length?u.call(a,0,n=a.length-1):(n=0,[]),i=a[n++],null==i?t:(o=function(){var t,e,n;for(n=[],t=0,e=o.length;e>t;t++)s=o[t],s.isBlockBreak()?(r=!0,n.push(y(s))):n.push(s);return n}(),r?new e.Text(u.call(o).concat([i])):t)},p=e.Text.textForStringWithAttributes("\n",{blockBreak:!0}),l=function(t){return m(t)?t:t.appendText(p)},m=function(t){var e,n;return n=t.getLength(),0===n?!1:(e=t.getTextAtRange([n-1,n]),e.isBlockBreak())},y=function(t){return t.copyWithoutAttribute("blockBreak")},d=function(t){var e;return e=o(t).listAttribute,null!=e?[e,t]:[t]},f=function(t){return t.slice(-1)[0]},g=function(t,e){var n;return n=t.lastIndexOf(e),-1===n?t:r(t,n,1)},a}(e.Object)}.call(this),function(){var t,n,o,i,r,s,a,u,c,l=function(t,e){function n(){this.constructor=t}for(var o in e)h.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},h={}.hasOwnProperty,p=[].slice,d=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.arraysAreEqual,a=e.normalizeSpaces,r=e.makeElement,u=e.tagName,i=e.getBlockTagNames,c=e.walkTree,o=e.findClosestElementFromNode,n=e.elementContainsNode,s=e.nodeIsAttachmentElement,e.HTMLParser=function(h){function f(t,e){this.html=t,this.referenceElement=(null!=e?e:{}).referenceElement,this.blocks=[],this.blockElements=[],this.processedElements=[]}var g,m,y,v,b,A,C,w,x,E,S,k,R,L,D,O;return l(f,h),g="style href src width height class".split(" "),f.parse=function(t,e){var n;return n=new this(t,e),n.parse(),n},f.prototype.getDocument=function(){return e.Document.fromJSON(this.blocks)},f.prototype.parse=function(){var t,e;try{for(this.createHiddenContainer(),t=R(this.html),this.containerElement.innerHTML=t,e=c(this.containerElement,{usingFilter:E});e.nextNode();)this.processNode(e.currentNode);return this.translateBlockElementMarginsToNewlines()}finally{this.removeHiddenContainer()}},f.prototype.createHiddenContainer=function(){return this.referenceElement?(this.containerElement=this.referenceElement.cloneNode(!1),this.containerElement.removeAttribute("id"),this.containerElement.setAttribute("data-trix-internal",""),this.containerElement.style.display="none",this.referenceElement.parentNode.insertBefore(this.containerElement,this.referenceElement.nextSibling)):(this.containerElement=r({tagName:"div",style:{display:"none"}}),document.body.appendChild(this.containerElement))},f.prototype.removeHiddenContainer=function(){return this.containerElement.parentNode.removeChild(this.containerElement)},R=function(t){var e,n,o,i,r,s,a,u,l,h,f,m,y,v,A,C;for(t=t.replace(/<\/html[^>]*>[^]*$/i,"</html>"),n=document.implementation.createHTMLDocument(""),n.documentElement.innerHTML=t,e=n.body,o=n.head,y=o.querySelectorAll("style"),i=0,a=y.length;a>i;i++)A=y[i],e.appendChild(A);for(m=[],C=c(e);C.nextNode();)switch(f=C.currentNode,f.nodeType){case Node.ELEMENT_NODE:if(b(f))m.push(f);else for(v=p.call(f.attributes),r=0,u=v.length;u>r;r++)h=v[r].name,d.call(g,h)>=0||0===h.indexOf("data-trix")||f.removeAttribute(h);break;case Node.COMMENT_NODE:m.push(f)}for(s=0,l=m.length;l>s;s++)f=m[s],f.parentNode.removeChild(f);return e.innerHTML},b=function(t){return(null!=t?t.nodeType:void 0)!==Node.ELEMENT_NODE||s(t)?void 0:"script"===u(t)||"false"===t.getAttribute("data-trix-serialize")},E=function(t){return"style"===u(t)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},f.prototype.processNode=function(t){switch(t.nodeType){case Node.TEXT_NODE:return this.processTextNode(t);case Node.ELEMENT_NODE:return this.appendBlockForElement(t),this.processElement(t)}},f.prototype.appendBlockForElement=function(e){var o,i,r,s;if(r=this.isBlockElement(e),i=n(this.currentBlockElement,e),r&&!this.isBlockElement(e.firstChild)){if(!(this.isInsignificantTextNode(e.firstChild)&&this.isBlockElement(e.firstElementChild)||(o=this.getBlockAttributes(e),i&&t(o,this.currentBlock.attributes))))return this.currentBlock=this.appendBlockForAttributesWithElement(o,e),this.currentBlockElement=e}else if(this.currentBlockElement&&!i&&!r)return(s=this.findParentBlockElement(e))?this.appendBlockForElement(s):(this.currentBlock=this.appendEmptyBlock(),this.currentBlockElement=null)},f.prototype.findParentBlockElement=function(t){var e;for(e=t.parentElement;e&&e!==this.containerElement;){if(this.isBlockElement(e)&&d.call(this.blockElements,e)>=0)return e;e=e.parentElement}return null},f.prototype.processTextNode=function(t){var e,n;return this.isInsignificantTextNode(t)?void 0:(n=t.data,v(t.parentNode)||(n=L(n),D(null!=(e=t.previousSibling)?e.textContent:void 0)&&(n=x(n))),this.appendStringWithAttributes(n,this.getTextAttributes(t.parentNode)))},f.prototype.processElement=function(t){var e,n,o,i,r;if(s(t))return e=A(t),Object.keys(e).length&&(i=this.getTextAttributes(t),this.appendAttachmentWithAttributes(e,i),t.innerHTML=""),this.processedElements.push(t);switch(u(t)){case"br":return this.isExtraBR(t)||this.isBlockElement(t.nextSibling)||this.appendStringWithAttributes("\n",this.getTextAttributes(t)),this.processedElements.push(t);case"img":e={url:t.getAttribute("src"),contentType:"image"},o=w(t);for(n in o)r=o[n],e[n]=r;return this.appendAttachmentWithAttributes(e,this.getTextAttributes(t)),this.processedElements.push(t);case"tr":if(t.parentNode.firstChild!==t)return this.appendStringWithAttributes("\n");break;case"td":if(t.parentNode.firstChild!==t)return this.appendStringWithAttributes(" | ")}},f.prototype.appendBlockForAttributesWithElement=function(t,e){var n;return this.blockElements.push(e),n=m(t),this.blocks.push(n),n},f.prototype.appendEmptyBlock=function(){return this.appendBlockForAttributesWithElement([],null)},f.prototype.appendStringWithAttributes=function(t,e){return this.appendPiece(k(t,e))},f.prototype.appendAttachmentWithAttributes=function(t,e){return this.appendPiece(S(t,e))},f.prototype.appendPiece=function(t){return 0===this.blocks.length&&this.appendEmptyBlock(),this.blocks[this.blocks.length-1].text.push(t)},f.prototype.appendStringToTextAtIndex=function(t,e){var n,o;return o=this.blocks[e].text,n=o[o.length-1],"string"===(null!=n?n.type:void 0)?n.string+=t:o.push(k(t))},f.prototype.prependStringToTextAtIndex=function(t,e){var n,o;return o=this.blocks[e].text,n=o[0],"string"===(null!=n?n.type:void 0)?n.string=t+n.string:o.unshift(k(t))},k=function(t,e){var n;return null==e&&(e={}),n="string",t=a(t),{string:t,attributes:e,type:n}},S=function(t,e){var n;return null==e&&(e={}),n="attachment",{attachment:t,attributes:e,type:n}},m=function(t){var e;return null==t&&(t={}),e=[],{text:e,attributes:t}},f.prototype.getTextAttributes=function(t){var n,i,r,a,u,c,l,h,p,d,f,g,m;r={},d=e.config.textAttributes;for(n in d)if(u=d[n],u.tagName&&o(t,{matchingSelector:u.tagName,untilNode:this.containerElement}))r[n]=!0;else if(u.parser&&(m=u.parser(t))){for(i=!1,f=this.findBlockElementAncestors(t),c=0,p=f.length;p>c;c++)if(a=f[c],u.parser(a)===m){i=!0;break}i||(r[n]=m)}if(s(t)&&(l=t.getAttribute("data-trix-attributes"))){g=JSON.parse(l);for(h in g)m=g[h],r[h]=m}return r},f.prototype.getBlockAttributes=function(t){var n,o,i,r;for(o=[];t&&t!==this.containerElement;){r=e.config.blockAttributes;for(n in r)i=r[n],i.parse!==!1&&u(t)===i.tagName&&(("function"==typeof i.test?i.test(t):void 0)||!i.test)&&(o.push(n),i.listAttribute&&o.push(i.listAttribute));t=t.parentNode}return o.reverse()},f.prototype.findBlockElementAncestors=function(t){var e,n;for(e=[];t&&t!==this.containerElement;)n=u(t),d.call(i(),n)>=0&&e.push(t),t=t.parentNode;return e},A=function(t){return JSON.parse(t.getAttribute("data-trix-attachment"))},w=function(t){var e,n,o;return o=t.getAttribute("width"),n=t.getAttribute("height"),e={},o&&(e.width=parseInt(o,10)),n&&(e.height=parseInt(n,10)),e},f.prototype.isBlockElement=function(t){var e;if((null!=t?t.nodeType:void 0)===Node.ELEMENT_NODE&&!o(t,{matchingSelector:"td",untilNode:this.containerElement}))return e=u(t),d.call(i(),e)>=0||"block"===window.getComputedStyle(t).display},f.prototype.isInsignificantTextNode=function(t){return(null!=t?t.nodeType:void 0)===Node.TEXT_NODE&&O(t.data)&&!v(t.parentNode)?!t.previousSibling||this.isBlockElement(t.previousSibling)||!t.nextSibling||this.isBlockElement(t.nextSibling):void 0},f.prototype.isExtraBR=function(t){return"br"===u(t)&&this.isBlockElement(t.parentNode)&&t.parentNode.lastChild===t},v=function(t){var e;return e=window.getComputedStyle(t).whiteSpace,"pre"===e||"pre-wrap"===e||"pre-line"===e},f.prototype.translateBlockElementMarginsToNewlines=function(){var t,e,n,o,i,r,s,a;for(e=this.getMarginOfDefaultBlockElement(),s=this.blocks,a=[],o=n=0,i=s.length;i>n;o=++n)t=s[o],(r=this.getMarginOfBlockElementAtIndex(o))&&(r.top>2*e.top&&this.prependStringToTextAtIndex("\n",o),a.push(r.bottom>2*e.bottom?this.appendStringToTextAtIndex("\n",o):void 0));return a},f.prototype.getMarginOfBlockElementAtIndex=function(t){var e,n;return!(e=this.blockElements[t])||(n=u(e),d.call(i(),n)>=0||d.call(this.processedElements,e)>=0)?void 0:C(e)},f.prototype.getMarginOfDefaultBlockElement=function(){var t;return t=r(e.config.blockAttributes["default"].tagName),this.containerElement.appendChild(t),C(t)},C=function(t){var e;return e=window.getComputedStyle(t),"block"===e.display?{top:parseInt(e.marginTop),bottom:parseInt(e.marginBottom)}:void 0},y=RegExp("[^\\S"+e.NON_BREAKING_SPACE+"]"),L=function(t){return t.replace(RegExp(""+y.source,"g")," ").replace(/\ {2,}/g," ")},x=function(t){return t.replace(RegExp("^"+y.source+"+"),"")},O=function(t){return RegExp("^"+y.source+"*$").test(t)},D=function(t){return/\s$/.test(t)},f}(e.BasicObject)}.call(this),function(){var t,n,o,i,r=function(t,e){function n(){this.constructor=t}for(var o in e)s.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},s={}.hasOwnProperty,a=[].slice,u=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.arraysAreEqual,o=e.normalizeRange,i=e.rangeIsCollapsed,n=e.getBlockConfig,e.Document=function(s){function c(t){null==t&&(t=[]),c.__super__.constructor.apply(this,arguments),0===t.length&&(t=[new e.Block]),this.blockList=e.SplittableList.box(t)}var l;return r(c,s),c.fromJSON=function(t){var n,o;return o=function(){var o,i,r;for(r=[],o=0,i=t.length;i>o;o++)n=t[o],r.push(e.Block.fromJSON(n));return r}(),new this(o)},c.fromHTML=function(t,n){return e.HTMLParser.parse(t,n).getDocument()},c.fromString=function(t,n){var o;return o=e.Text.textForStringWithAttributes(t,n),new this([new e.Block(o)])},c.prototype.isEmpty=function(){var t;return 1===this.blockList.length&&(t=this.getBlockAtIndex(0),t.isEmpty()&&!t.hasAttributes())},c.prototype.copy=function(t){var e;return null==t&&(t={}),e=t.consolidateBlocks?this.blockList.consolidate().toArray():this.blockList.toArray(),new this.constructor(e)},c.prototype.copyUsingObjectsFromDocument=function(t){var n;return n=new e.ObjectMap(t.getObjects()),this.copyUsingObjectMap(n)},c.prototype.copyUsingObjectMap=function(t){var e,n,o;return n=function(){var n,i,r,s;for(r=this.getBlocks(),s=[],n=0,i=r.length;i>n;n++)e=r[n],s.push((o=t.find(e))?o:e.copyUsingObjectMap(t));return s}.call(this),new this.constructor(n)},c.prototype.copyWithBaseBlockAttributes=function(t){var e,n,o;return null==t&&(t=[]),o=function(){var o,i,r,s;for(r=this.getBlocks(),s=[],o=0,i=r.length;i>o;o++)n=r[o],e=t.concat(n.getAttributes()),s.push(n.copyWithAttributes(e));return s}.call(this),new this.constructor(o)},c.prototype.replaceBlock=function(t,e){var n;return n=this.blockList.indexOf(t),-1===n?this:new this.constructor(this.blockList.replaceObjectAtIndex(e,n))},c.prototype.insertDocumentAtRange=function(t,e){var n,r,s,a,u,c,l;return r=t.blockList,u=(e=o(e))[0],c=this.locationFromPosition(u),s=c.index,a=c.offset,l=this,n=this.getBlockAtPosition(u),i(e)&&n.isEmpty()&&!n.hasAttributes()?l=new this.constructor(l.blockList.removeObjectAtIndex(s)):n.getBlockBreakPosition()===a&&u++,l=l.removeTextAtRange(e),new this.constructor(l.blockList.insertSplittableListAtPosition(r,u))},c.prototype.mergeDocumentAtRange=function(e,n){var i,r,s,a,u,c,l,h,p,d,f,g;return f=(n=o(n))[0],d=this.locationFromPosition(f),r=this.getBlockAtIndex(d.index).getAttributes(),i=e.getBaseBlockAttributes(),g=r.slice(-i.length),t(i,g)?(l=r.slice(0,-i.length),c=e.copyWithBaseBlockAttributes(l)):c=e.copy({consolidateBlocks:!0}).copyWithBaseBlockAttributes(r),s=c.getBlockCount(),a=c.getBlockAtIndex(0),t(r,a.getAttributes())?(u=a.getTextWithoutBlockBreak(),p=this.insertTextAtRange(u,n),s>1&&(c=new this.constructor(c.getBlocks().slice(1)),h=f+u.getLength(),p=p.insertDocumentAtRange(c,h))):p=this.insertDocumentAtRange(c,n),p
},c.prototype.insertTextAtRange=function(t,e){var n,i,r,s,a;return a=(e=o(e))[0],s=this.locationFromPosition(a),i=s.index,r=s.offset,n=this.removeTextAtRange(e),new this.constructor(n.blockList.editObjectAtIndex(i,function(e){return e.copyWithText(e.text.insertTextAtPosition(t,r))}))},c.prototype.removeTextAtRange=function(t){var e,n,r,s,a,u,c,l,h,p,d,f,g,m,y,v,b,A,C,w,x;return p=t=o(t),l=p[0],A=p[1],i(t)?this:(d=this.locationRangeFromRange(t),u=d[0],v=d[1],a=u.index,c=u.offset,s=this.getBlockAtIndex(a),y=v.index,b=v.offset,m=this.getBlockAtIndex(y),f=A-l===1&&s.getBlockBreakPosition()===c&&m.getBlockBreakPosition()!==b&&"\n"===m.text.getStringAtPosition(b),f?r=this.blockList.editObjectAtIndex(y,function(t){return t.copyWithText(t.text.removeTextAtRange([b,b+1]))}):(h=s.text.getTextAtRange([0,c]),C=m.text.getTextAtRange([b,m.getLength()]),w=h.appendText(C),g=a!==y&&0===c,x=g&&s.getAttributeLevel()>=m.getAttributeLevel(),n=x?m.copyWithText(w):s.copyWithText(w),e=y+1-a,r=this.blockList.splice(a,e,n)),new this.constructor(r))},c.prototype.moveTextFromRangeToPosition=function(t,e){var n,i,r,s,u,c,l,h,p,d;if(c=t=o(t),p=c[0],r=c[1],e>=p&&r>=e)return this;if(i=this.getDocumentAtRange(t),h=this.removeTextAtRange(t),u=e>p,u&&(e-=i.getLength()),!h.firstBlockInRangeIsEntirelySelected(t)){if(l=i.getBlocks(),s=l[0],n=2<=l.length?a.call(l,1):[],0===n.length?(d=s.getTextWithoutBlockBreak(),u&&(e+=1)):d=s.text,h=h.insertTextAtRange(d,e),0===n.length)return h;i=new this.constructor(n),e+=d.getLength()}return h.insertDocumentAtRange(i,e)},c.prototype.addAttributeAtRange=function(t,e,o){var i;return i=this.blockList,this.eachBlockAtRange(o,function(o,r,s){return i=i.editObjectAtIndex(s,function(){return n(t)?o.addAttribute(t,e):r[0]===r[1]?o:o.copyWithText(o.text.addAttributeAtRange(t,e,r))})}),new this.constructor(i)},c.prototype.addAttribute=function(t,e){var n;return n=this.blockList,this.eachBlock(function(o,i){return n=n.editObjectAtIndex(i,function(){return o.addAttribute(t,e)})}),new this.constructor(n)},c.prototype.removeAttributeAtRange=function(t,e){var o;return o=this.blockList,this.eachBlockAtRange(e,function(e,i,r){return n(t)?o=o.editObjectAtIndex(r,function(){return e.removeAttribute(t)}):i[0]!==i[1]?o=o.editObjectAtIndex(r,function(){return e.copyWithText(e.text.removeAttributeAtRange(t,i))}):void 0}),new this.constructor(o)},c.prototype.updateAttributesForAttachment=function(t,e){var n,o,i,r;return i=(o=this.getRangeOfAttachment(e))[0],n=this.locationFromPosition(i).index,r=this.getTextAtIndex(n),new this.constructor(this.blockList.editObjectAtIndex(n,function(n){return n.copyWithText(r.updateAttributesForAttachment(t,e))}))},c.prototype.removeAttributeForAttachment=function(t,e){var n;return n=this.getRangeOfAttachment(e),this.removeAttributeAtRange(t,n)},c.prototype.insertBlockBreakAtRange=function(t){var n,i,r,s;return s=(t=o(t))[0],r=this.locationFromPosition(s).offset,i=this.removeTextAtRange(t),0===r&&(n=[new e.Block]),new this.constructor(i.blockList.insertSplittableListAtPosition(new e.SplittableList(n),s))},c.prototype.applyBlockAttributeAtRange=function(t,e,o){var i,r,s,a;return s=this.expandRangeToLineBreaksAndSplitBlocks(o),r=s.document,o=s.range,i=n(t),i.listAttribute?(r=r.removeLastListAttributeAtRange(o,{exceptAttributeName:t}),a=r.convertLineBreaksToBlockBreaksInRange(o),r=a.document,o=a.range):r=i.terminal?r.removeLastTerminalAttributeAtRange(o):r.consolidateBlocksAtRange(o),r.addAttributeAtRange(t,e,o)},c.prototype.removeLastListAttributeAtRange=function(t,e){var o;return null==e&&(e={}),o=this.blockList,this.eachBlockAtRange(t,function(t,i,r){var s;if((s=t.getLastAttribute())&&n(s).listAttribute&&s!==e.exceptAttributeName)return o=o.editObjectAtIndex(r,function(){return t.removeAttribute(s)})}),new this.constructor(o)},c.prototype.removeLastTerminalAttributeAtRange=function(t){var e;return e=this.blockList,this.eachBlockAtRange(t,function(t,o,i){var r;if((r=t.getLastAttribute())&&n(r).terminal)return e=e.editObjectAtIndex(i,function(){return t.removeAttribute(r)})}),new this.constructor(e)},c.prototype.firstBlockInRangeIsEntirelySelected=function(t){var e,n,i,r,s,a;return r=t=o(t),a=r[0],e=r[1],n=this.locationFromPosition(a),s=this.locationFromPosition(e),0===n.offset&&n.index<s.index?!0:n.index===s.index?(i=this.getBlockAtIndex(n.index).getLength(),0===n.offset&&s.offset===i):!1},c.prototype.expandRangeToLineBreaksAndSplitBlocks=function(t){var e,n,i,r,s,a,u,c,l;return a=t=o(t),l=a[0],r=a[1],c=this.locationFromPosition(l),i=this.locationFromPosition(r),e=this,u=e.getBlockAtIndex(c.index),null!=(c.offset=u.findLineBreakInDirectionFromPosition("backward",c.offset))&&(s=e.positionFromLocation(c),e=e.insertBlockBreakAtRange([s,s+1]),i.index+=1,i.offset-=e.getBlockAtIndex(c.index).getLength(),c.index+=1),c.offset=0,0===i.offset&&i.index>c.index?(i.index-=1,i.offset=e.getBlockAtIndex(i.index).getBlockBreakPosition()):(n=e.getBlockAtIndex(i.index),"\n"===n.text.getStringAtRange([i.offset-1,i.offset])?i.offset-=1:i.offset=n.findLineBreakInDirectionFromPosition("forward",i.offset),i.offset!==n.getBlockBreakPosition()&&(s=e.positionFromLocation(i),e=e.insertBlockBreakAtRange([s,s+1]))),l=e.positionFromLocation(c),r=e.positionFromLocation(i),t=o([l,r]),{document:e,range:t}},c.prototype.convertLineBreaksToBlockBreaksInRange=function(t){var e,n,i;return n=(t=o(t))[0],i=this.getStringAtRange(t).slice(0,-1),e=this,i.replace(/.*?\n/g,function(t){return n+=t.length,e=e.insertBlockBreakAtRange([n-1,n])}),{document:e,range:t}},c.prototype.consolidateBlocksAtRange=function(t){var e,n,i,r,s;return i=t=o(t),s=i[0],n=i[1],r=this.locationFromPosition(s).index,e=this.locationFromPosition(n).index,new this.constructor(this.blockList.consolidateFromIndexToIndex(r,e))},c.prototype.getDocumentAtRange=function(t){var e;return t=o(t),e=this.blockList.getSplittableListInRange(t).toArray(),new this.constructor(e)},c.prototype.getStringAtRange=function(t){var e,n,i;return i=t=o(t),n=i[i.length-1],n!==this.getLength()&&(e=-1),this.getDocumentAtRange(t).toString().slice(0,e)},c.prototype.getBlockAtIndex=function(t){return this.blockList.getObjectAtIndex(t)},c.prototype.getBlockAtPosition=function(t){var e;return e=this.locationFromPosition(t).index,this.getBlockAtIndex(e)},c.prototype.getTextAtIndex=function(t){var e;return null!=(e=this.getBlockAtIndex(t))?e.text:void 0},c.prototype.getTextAtPosition=function(t){var e;return e=this.locationFromPosition(t).index,this.getTextAtIndex(e)},c.prototype.getPieceAtPosition=function(t){var e,n,o;return o=this.locationFromPosition(t),e=o.index,n=o.offset,this.getTextAtIndex(e).getPieceAtPosition(n)},c.prototype.getCharacterAtPosition=function(t){var e,n,o;return o=this.locationFromPosition(t),e=o.index,n=o.offset,this.getTextAtIndex(e).getStringAtRange([n,n+1])},c.prototype.getLength=function(){return this.blockList.getEndPosition()},c.prototype.getBlocks=function(){return this.blockList.toArray()},c.prototype.getBlockCount=function(){return this.blockList.length},c.prototype.getEditCount=function(){return this.editCount},c.prototype.eachBlock=function(t){return this.blockList.eachObject(t)},c.prototype.eachBlockAtRange=function(t,e){var n,i,r,s,a,u,c,l,h,p,d,f;if(u=t=o(t),d=u[0],r=u[1],p=this.locationFromPosition(d),i=this.locationFromPosition(r),p.index===i.index)return n=this.getBlockAtIndex(p.index),f=[p.offset,i.offset],e(n,f,p.index);for(h=[],a=s=c=p.index,l=i.index;l>=c?l>=s:s>=l;a=l>=c?++s:--s)(n=this.getBlockAtIndex(a))?(f=function(){switch(a){case p.index:return[p.offset,n.text.getLength()];case i.index:return[0,i.offset];default:return[0,n.text.getLength()]}}(),h.push(e(n,f,a))):h.push(void 0);return h},c.prototype.getCommonAttributesAtRange=function(t){var n,r,s;return r=(t=o(t))[0],i(t)?this.getCommonAttributesAtPosition(r):(s=[],n=[],this.eachBlockAtRange(t,function(t,e){return e[0]!==e[1]?(s.push(t.text.getCommonAttributesAtRange(e)),n.push(l(t))):void 0}),e.Hash.fromCommonAttributesOfObjects(s).merge(e.Hash.fromCommonAttributesOfObjects(n)).toObject())},c.prototype.getCommonAttributesAtPosition=function(t){var n,o,i,r,s,a,c,h,p,d;if(p=this.locationFromPosition(t),s=p.index,h=p.offset,i=this.getBlockAtIndex(s),!i)return{};r=l(i),n=i.text.getAttributesAtPosition(h),o=i.text.getAttributesAtPosition(h-1),a=function(){var t,n;t=e.config.textAttributes,n=[];for(c in t)d=t[c],d.inheritable&&n.push(c);return n}();for(c in o)d=o[c],(d===n[c]||u.call(a,c)>=0)&&(r[c]=d);return r},c.prototype.getRangeOfCommonAttributeAtPosition=function(t,e){var n,i,r,s,a,u,c,l,h;return a=this.locationFromPosition(e),r=a.index,s=a.offset,h=this.getTextAtIndex(r),u=h.getExpandedRangeForAttributeAtOffset(t,s),l=u[0],i=u[1],c=this.positionFromLocation({index:r,offset:l}),n=this.positionFromLocation({index:r,offset:i}),o([c,n])},c.prototype.getBaseBlockAttributes=function(){var t,e,n,o,i,r,s;for(t=this.getBlockAtIndex(0).getAttributes(),n=o=1,s=this.getBlockCount();s>=1?s>o:o>s;n=s>=1?++o:--o)e=this.getBlockAtIndex(n).getAttributes(),r=Math.min(t.length,e.length),t=function(){var n,o,s;for(s=[],i=n=0,o=r;(o>=0?o>n:n>o)&&e[i]===t[i];i=o>=0?++n:--n)s.push(e[i]);return s}();return t},l=function(t){var e,n;return n={},(e=t.getLastAttribute())&&(n[e]=!0),n},c.prototype.getAttachmentById=function(t){var e,n,o,i;for(i=this.getAttachments(),n=0,o=i.length;o>n;n++)if(e=i[n],e.id===t)return e},c.prototype.getAttachmentPieces=function(){var t;return t=[],this.blockList.eachObject(function(e){var n;return n=e.text,t=t.concat(n.getAttachmentPieces())}),t},c.prototype.getAttachments=function(){var t,e,n,o,i;for(o=this.getAttachmentPieces(),i=[],t=0,e=o.length;e>t;t++)n=o[t],i.push(n.attachment);return i},c.prototype.getRangeOfAttachment=function(t){var e,n,i,r,s,a,u;for(r=0,s=this.blockList.toArray(),n=e=0,i=s.length;i>e;n=++e){if(a=s[n].text,u=a.getRangeOfAttachment(t))return o([r+u[0],r+u[1]]);r+=a.getLength()}},c.prototype.getLocationRangeOfAttachment=function(t){var e;return e=this.getRangeOfAttachment(t),this.locationRangeFromRange(e)},c.prototype.getAttachmentPieceForAttachment=function(t){var e,n,o,i;for(i=this.getAttachmentPieces(),e=0,n=i.length;n>e;e++)if(o=i[e],o.attachment===t)return o},c.prototype.findRangesForTextAttribute=function(t,e){var n,o,i,r,s,a,u,c,l,h;for(h=(null!=e?e:{}).withValue,a=0,u=[],c=[],r=function(e){return null!=h?e.getAttribute(t)===h:e.hasAttribute(t)},l=this.getPieces(),n=0,o=l.length;o>n;n++)s=l[n],i=s.getLength(),r(s)&&(u[1]===a?u[1]=a+i:c.push(u=[a,a+i])),a+=i;return c},c.prototype.locationFromPosition=function(t){var e,n;return n=this.blockList.findIndexAndOffsetAtPosition(Math.max(0,t)),null!=n.index?n:(e=this.getBlocks(),{index:e.length-1,offset:e[e.length-1].getLength()})},c.prototype.positionFromLocation=function(t){return this.blockList.findPositionAtIndexAndOffset(t.index,t.offset)},c.prototype.locationRangeFromPosition=function(t){return o(this.locationFromPosition(t))},c.prototype.locationRangeFromRange=function(t){var e,n,i,r;if(t=o(t))return r=t[0],n=t[1],i=this.locationFromPosition(r),e=this.locationFromPosition(n),o([i,e])},c.prototype.rangeFromLocationRange=function(t){var e,n;return t=o(t),e=this.positionFromLocation(t[0]),i(t)||(n=this.positionFromLocation(t[1])),o([e,n])},c.prototype.isEqualTo=function(t){return this.blockList.isEqualTo(null!=t?t.blockList:void 0)},c.prototype.getTexts=function(){var t,e,n,o,i;for(o=this.getBlocks(),i=[],e=0,n=o.length;n>e;e++)t=o[e],i.push(t.text);return i},c.prototype.getPieces=function(){var t,e,n,o,i;for(n=[],o=this.getTexts(),t=0,e=o.length;e>t;t++)i=o[t],n.push.apply(n,i.getPieces());return n},c.prototype.getObjects=function(){return this.getBlocks().concat(this.getTexts()).concat(this.getPieces())},c.prototype.toSerializableDocument=function(){var t;return t=[],this.blockList.eachObject(function(e){return t.push(e.copyWithText(e.text.toSerializableText()))}),new this.constructor(t)},c.prototype.toString=function(){return this.blockList.toString()},c.prototype.toJSON=function(){return this.blockList.toJSON()},c.prototype.toConsole=function(){var t;return JSON.stringify(function(){var e,n,o,i;for(o=this.blockList.toArray(),i=[],e=0,n=o.length;n>e;e++)t=o[e],i.push(JSON.parse(t.text.toConsole()));return i}.call(this))},c}(e.Object)}.call(this),function(){e.LineBreakInsertion=function(){function t(t){var e;this.composition=t,this.document=this.composition.document,e=this.composition.getSelectedRange(),this.startPosition=e[0],this.endPosition=e[1],this.startLocation=this.document.locationFromPosition(this.startPosition),this.endLocation=this.document.locationFromPosition(this.endPosition),this.block=this.document.getBlockAtIndex(this.endLocation.index),this.breaksOnReturn=this.block.breaksOnReturn(),this.previousCharacter=this.block.text.getStringAtPosition(this.endLocation.offset-1),this.nextCharacter=this.block.text.getStringAtPosition(this.endLocation.offset)}return t.prototype.shouldInsertBlockBreak=function(){return this.block.hasAttributes()&&this.block.isListItem()&&!this.block.isEmpty()?0!==this.startLocation.offset:this.breaksOnReturn&&"\n"!==this.nextCharacter},t.prototype.shouldBreakFormattedBlock=function(){return this.block.hasAttributes()&&!this.block.isListItem()&&(this.breaksOnReturn&&"\n"===this.nextCharacter||"\n"===this.previousCharacter)},t.prototype.shouldDecreaseListLevel=function(){return this.block.hasAttributes()&&this.block.isListItem()&&this.block.isEmpty()},t.prototype.shouldPrependListItem=function(){return this.block.isListItem()&&0===this.startLocation.offset&&!this.block.isEmpty()},t.prototype.shouldRemoveLastBlockAttribute=function(){return this.block.hasAttributes()&&!this.block.isListItem()&&this.block.isEmpty()},t}()}.call(this),function(){var t,n,o,i,r,s,a,u,c,l,h=function(t,e){function n(){this.constructor=t}for(var o in e)p.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},p={}.hasOwnProperty;s=e.normalizeRange,c=e.rangesAreEqual,u=e.rangeIsCollapsed,a=e.objectsAreEqual,t=e.arrayStartsWith,l=e.summarizeArrayChange,o=e.getAllAttributeNames,i=e.getBlockConfig,r=e.getTextConfig,n=e.extend,e.Composition=function(p){function d(){this.document=new e.Document,this.attachments=[],this.currentAttributes={},this.revision=0}var f;return h(d,p),d.prototype.setDocument=function(t){var e;return t.isEqualTo(this.document)?void 0:(this.document=t,this.refreshAttachments(),this.revision++,null!=(e=this.delegate)&&"function"==typeof e.compositionDidChangeDocument?e.compositionDidChangeDocument(t):void 0)},d.prototype.getSnapshot=function(){return{document:this.document,selectedRange:this.getSelectedRange()}},d.prototype.loadSnapshot=function(t){var n,o,i,r;return n=t.document,r=t.selectedRange,null!=(o=this.delegate)&&"function"==typeof o.compositionWillLoadSnapshot&&o.compositionWillLoadSnapshot(),this.setDocument(null!=n?n:new e.Document),this.setSelection(null!=r?r:[0,0]),null!=(i=this.delegate)&&"function"==typeof i.compositionDidLoadSnapshot?i.compositionDidLoadSnapshot():void 0},d.prototype.insertText=function(t,e){var n,o,i,r;return r=(null!=e?e:{updatePosition:!0}).updatePosition,o=this.getSelectedRange(),this.setDocument(this.document.insertTextAtRange(t,o)),i=o[0],n=i+t.getLength(),r&&this.setSelection(n),this.notifyDelegateOfInsertionAtRange([i,n])},d.prototype.insertBlock=function(t){var n;return null==t&&(t=new e.Block),n=new e.Document([t]),this.insertDocument(n)},d.prototype.insertDocument=function(t){var n,o,i;return null==t&&(t=new e.Document),o=this.getSelectedRange(),this.setDocument(this.document.insertDocumentAtRange(t,o)),i=o[0],n=i+t.getLength(),this.setSelection(n),this.notifyDelegateOfInsertionAtRange([i,n])},d.prototype.insertString=function(t,n){var o,i;return o=this.getCurrentTextAttributes(),i=e.Text.textForStringWithAttributes(t,o),this.insertText(i,n)},d.prototype.insertBlockBreak=function(){var t,e,n;return e=this.getSelectedRange(),this.setDocument(this.document.insertBlockBreakAtRange(e)),n=e[0],t=n+1,this.setSelection(t),this.notifyDelegateOfInsertionAtRange([n,t])},d.prototype.insertLineBreak=function(){var t,n;return n=new e.LineBreakInsertion(this),n.shouldDecreaseListLevel()?(this.decreaseListLevel(),this.setSelection(n.startPosition)):n.shouldPrependListItem()?(t=new e.Document([n.block.copyWithoutText()]),this.insertDocument(t)):n.shouldInsertBlockBreak()?this.insertBlockBreak():n.shouldRemoveLastBlockAttribute()?this.removeLastBlockAttribute():n.shouldBreakFormattedBlock()?this.breakFormattedBlock(n):this.insertString("\n")},d.prototype.insertHTML=function(t){var n,o,i,r,s;return s=this.getPosition(),r=this.document.getLength(),n=e.Document.fromHTML(t),this.setDocument(this.document.mergeDocumentAtRange(n,this.getSelectedRange())),o=this.document.getLength(),i=s+(o-r),this.setSelection(i),this.notifyDelegateOfInsertionAtRange([s,i])},d.prototype.replaceHTML=function(t){var n,o,i;return n=e.Document.fromHTML(t).copyUsingObjectsFromDocument(this.document),o=this.getLocationRange({strict:!1}),i=this.document.rangeFromLocationRange(o),this.setDocument(n),this.setSelection(i)},d.prototype.insertFile=function(t){var n,o;return(null!=(o=this.delegate)?o.compositionShouldAcceptFile(t):void 0)?(n=e.Attachment.attachmentForFile(t),this.insertAttachment(n)):void 0},d.prototype.insertFiles=function(t){var n,o,i,r,s,a,u;for(u=new e.Text,r=0,s=t.length;s>r;r++)i=t[r],(null!=(a=this.delegate)?a.compositionShouldAcceptFile(i):void 0)&&(n=e.Attachment.attachmentForFile(i),o=e.Text.textForAttachmentWithAttributes(n,this.currentAttributes),u=u.appendText(o));return this.insertText(u)},d.prototype.insertAttachment=function(t){var n;return n=e.Text.textForAttachmentWithAttributes(t,this.currentAttributes),this.insertText(n)},d.prototype.deleteInDirection=function(t){var e,n,o,i,r,s,a;return i=this.getLocationRange(),r=this.getSelectedRange(),s=u(r),s?o="backward"===t&&0===i[0].offset:a=i[0].index!==i[1].index,o&&this.canDecreaseBlockAttributeLevel()&&(n=this.getBlock(),n.isListItem()?this.decreaseListLevel():this.decreaseBlockAttributeLevel(),this.setSelection(r[0]),n.isEmpty())?!1:(s&&(r=this.getExpandedRangeInDirection(t),"backward"===t&&(e=this.getAttachmentAtRange(r))),e?(this.editAttachment(e),!1):(this.setDocument(this.document.removeTextAtRange(r)),this.setSelection(r[0]),o||a?!1:void 0))},d.prototype.moveTextFromRange=function(t){var e;return e=this.getSelectedRange()[0],this.setDocument(this.document.moveTextFromRangeToPosition(t,e)),this.setSelection(e)},d.prototype.removeAttachment=function(t){var e;return(e=this.document.getRangeOfAttachment(t))?(this.stopEditingAttachment(),this.setDocument(this.document.removeTextAtRange(e)),this.setSelection(e[0])):void 0},d.prototype.removeLastBlockAttribute=function(){var t,e,n,o;return n=this.getSelectedRange(),o=n[0],e=n[1],t=this.document.getBlockAtPosition(e),this.removeCurrentAttribute(t.getLastAttribute()),this.setSelection(o)},f=" ",d.prototype.insertPlaceholder=function(){return this.placeholderPosition=this.getPosition(),this.insertString(f)},d.prototype.selectPlaceholder=function(){return null!=this.placeholderPosition?(this.setSelectedRange([this.placeholderPosition,this.placeholderPosition+f.length]),this.getSelectedRange()):void 0},d.prototype.forgetPlaceholder=function(){return this.placeholderPosition=null},d.prototype.hasCurrentAttribute=function(t){var e;return e=this.currentAttributes[t],null!=e&&e!==!1},d.prototype.toggleCurrentAttribute=function(t){var e;return(e=!this.currentAttributes[t])?this.setCurrentAttribute(t,e):this.removeCurrentAttribute(t)},d.prototype.canSetCurrentAttribute=function(t){return i(t)?this.canSetCurrentBlockAttribute(t):this.canSetCurrentTextAttribute(t)},d.prototype.canSetCurrentTextAttribute=function(t){switch(t){case"href":return!this.selectionContainsAttachmentWithAttribute(t);default:return!0}},d.prototype.canSetCurrentBlockAttribute=function(){var t;if(t=this.getBlock())return!t.isTerminalBlock()},d.prototype.setCurrentAttribute=function(t,e){return i(t)?this.setBlockAttribute(t,e):(this.setTextAttribute(t,e),this.currentAttributes[t]=e,this.notifyDelegateOfCurrentAttributesChange())},d.prototype.setTextAttribute=function(t,n){var o,i,r,s;if(i=this.getSelectedRange())return r=i[0],o=i[1],r!==o?this.setDocument(this.document.addAttributeAtRange(t,n,i)):"href"===t?(s=e.Text.textForStringWithAttributes(n,{href:n}),this.insertText(s)):void 0},d.prototype.setBlockAttribute=function(t,e){var n,o;if(o=this.getSelectedRange())return this.canSetCurrentAttribute(t)?(n=this.getBlock(),this.setDocument(this.document.applyBlockAttributeAtRange(t,e,o)),this.setSelection(o)):void 0},d.prototype.removeCurrentAttribute=function(t){return i(t)?(this.removeBlockAttribute(t),this.updateCurrentAttributes()):(this.removeTextAttribute(t),delete this.currentAttributes[t],this.notifyDelegateOfCurrentAttributesChange())},d.prototype.removeTextAttribute=function(t){var e;if(e=this.getSelectedRange())return this.setDocument(this.document.removeAttributeAtRange(t,e))},d.prototype.removeBlockAttribute=function(t){var e;if(e=this.getSelectedRange())return this.setDocument(this.document.removeAttributeAtRange(t,e))},d.prototype.canDecreaseNestingLevel=function(){var t;return(null!=(t=this.getBlock())?t.getNestingLevel():void 0)>0},d.prototype.canIncreaseNestingLevel=function(){var e,n,o;if(e=this.getBlock())return(null!=(o=i(e.getLastNestableAttribute()))?o.listAttribute:0)?(n=this.getPreviousBlock())?t(n.getListItemAttributes(),e.getListItemAttributes()):void 0:e.getNestingLevel()>0},d.prototype.decreaseNestingLevel=function(){var t;if(t=this.getBlock())return this.setDocument(this.document.replaceBlock(t,t.decreaseNestingLevel()))},d.prototype.increaseNestingLevel=function(){var t;if(t=this.getBlock())return this.setDocument(this.document.replaceBlock(t,t.increaseNestingLevel()))},d.prototype.canDecreaseBlockAttributeLevel=function(){var t;return(null!=(t=this.getBlock())?t.getAttributeLevel():void 0)>0},d.prototype.decreaseBlockAttributeLevel=function(){var t,e;return(t=null!=(e=this.getBlock())?e.getLastAttribute():void 0)?this.removeCurrentAttribute(t):void 0},d.prototype.decreaseListLevel=function(){var t,e,n,o,i,r;for(r=this.getSelectedRange()[0],i=this.document.locationFromPosition(r).index,n=i,t=this.getBlock().getAttributeLevel();(e=this.document.getBlockAtIndex(n+1))&&e.isListItem()&&e.getAttributeLevel()>t;)n++;return r=this.document.positionFromLocation({index:i,offset:0}),o=this.document.positionFromLocation({index:n,offset:0}),this.setDocument(this.document.removeLastListAttributeAtRange([r,o]))},d.prototype.updateCurrentAttributes=function(){var t,e,n,i,r,s;if(s=this.getSelectedRange({ignoreLock:!0})){for(e=this.document.getCommonAttributesAtRange(s),r=o(),n=0,i=r.length;i>n;n++)t=r[n],e[t]||this.canSetCurrentAttribute(t)||(e[t]=!1);if(!a(e,this.currentAttributes))return this.currentAttributes=e,this.notifyDelegateOfCurrentAttributesChange()}},d.prototype.getCurrentAttributes=function(){return n.call({},this.currentAttributes)},d.prototype.getCurrentTextAttributes=function(){var t,e,n,o;t={},n=this.currentAttributes;for(e in n)o=n[e],r(e)&&(t[e]=o);return t},d.prototype.freezeSelection=function(){return this.setCurrentAttribute("frozen",!0)},d.prototype.thawSelection=function(){return this.removeCurrentAttribute("frozen")},d.prototype.hasFrozenSelection=function(){return this.hasCurrentAttribute("frozen")},d.proxyMethod("getSelectionManager().getPointRange"),d.proxyMethod("getSelectionManager().setLocationRangeFromPointRange"),d.proxyMethod("getSelectionManager().locationIsCursorTarget"),d.proxyMethod("getSelectionManager().selectionIsExpanded"),d.proxyMethod("delegate?.getSelectionManager"),d.prototype.setSelection=function(t){var e,n;return e=this.document.locationRangeFromRange(t),null!=(n=this.delegate)?n.compositionDidRequestChangingSelectionToLocationRange(e):void 0},d.prototype.getSelectedRange=function(){var t;return(t=this.getLocationRange())?this.document.rangeFromLocationRange(t):void 0},d.prototype.setSelectedRange=function(t){var e;return e=this.document.locationRangeFromRange(t),this.getSelectionManager().setLocationRange(e)},d.prototype.getPosition=function(){var t;return(t=this.getLocationRange())?this.document.positionFromLocation(t[0]):void 0},d.prototype.getLocationRange=function(t){var e;return null!=(e=this.getSelectionManager().getLocationRange(t))?e:s({index:0,offset:0})},d.prototype.getExpandedRangeInDirection=function(t){var e,n,o;return n=this.getSelectedRange(),o=n[0],e=n[1],"backward"===t?o=this.translateUTF16PositionFromOffset(o,-1):e=this.translateUTF16PositionFromOffset(e,1),s([o,e])},d.prototype.moveCursorInDirection=function(t){var e,n,o,i;return this.editingAttachment?o=this.document.getRangeOfAttachment(this.editingAttachment):(i=this.getSelectedRange(),o=this.getExpandedRangeInDirection(t),n=!c(i,o)),this.setSelectedRange("backward"===t?o[0]:o[1]),n&&(e=this.getAttachmentAtRange(o))?this.editAttachment(e):void 0},d.prototype.expandSelectionInDirection=function(t){var e;return e=this.getExpandedRangeInDirection(t),this.setSelectedRange(e)},d.prototype.expandSelectionForEditing=function(){return this.hasCurrentAttribute("href")?this.expandSelectionAroundCommonAttribute("href"):void 0},d.prototype.expandSelectionAroundCommonAttribute=function(t){var e,n;return e=this.getPosition(),n=this.document.getRangeOfCommonAttributeAtPosition(t,e),this.setSelectedRange(n)},d.prototype.selectionContainsAttachmentWithAttribute=function(t){var e,n,o,i,r;if(r=this.getSelectedRange()){for(i=this.document.getDocumentAtRange(r).getAttachments(),n=0,o=i.length;o>n;n++)if(e=i[n],e.hasAttribute(t))return!0;return!1}},d.prototype.selectionIsInCursorTarget=function(){return this.editingAttachment||this.positionIsCursorTarget(this.getPosition())},d.prototype.positionIsCursorTarget=function(t){var e;return(e=this.document.locationFromPosition(t))?this.locationIsCursorTarget(e):void 0},d.prototype.positionIsBlockBreak=function(t){var e;return null!=(e=this.document.getPieceAtPosition(t))?e.isBlockBreak():void 0},d.prototype.getSelectedDocument=function(){var t;return(t=this.getSelectedRange())?this.document.getDocumentAtRange(t):void 0},d.prototype.getAttachments=function(){return this.attachments.slice(0)},d.prototype.refreshAttachments=function(){var t,e,n,o,i,r,s,a,u,c,h,p;for(n=this.document.getAttachments(),a=l(this.attachments,n),t=a.added,h=a.removed,this.attachments=n,o=0,r=h.length;r>o;o++)e=h[o],e.delegate=null,null!=(u=this.delegate)&&"function"==typeof u.compositionDidRemoveAttachment&&u.compositionDidRemoveAttachment(e);for(p=[],i=0,s=t.length;s>i;i++)e=t[i],e.delegate=this,p.push(null!=(c=this.delegate)&&"function"==typeof c.compositionDidAddAttachment?c.compositionDidAddAttachment(e):void 0);return p},d.prototype.attachmentDidChangeAttributes=function(t){var e;return this.revision++,null!=(e=this.delegate)&&"function"==typeof e.compositionDidEditAttachment?e.compositionDidEditAttachment(t):void 0},d.prototype.attachmentDidChangePreviewURL=function(t){var e;return this.revision++,null!=(e=this.delegate)&&"function"==typeof e.compositionDidChangeAttachmentPreviewURL?e.compositionDidChangeAttachmentPreviewURL(t):void 0},d.prototype.editAttachment=function(t){var e;if(t!==this.editingAttachment)return this.stopEditingAttachment(),this.editingAttachment=t,null!=(e=this.delegate)&&"function"==typeof e.compositionDidStartEditingAttachment?e.compositionDidStartEditingAttachment(this.editingAttachment):void 0},d.prototype.stopEditingAttachment=function(){var t;if(this.editingAttachment)return null!=(t=this.delegate)&&"function"==typeof t.compositionDidStopEditingAttachment&&t.compositionDidStopEditingAttachment(this.editingAttachment),this.editingAttachment=null},d.prototype.canEditAttachmentCaption=function(){var t;return null!=(t=this.editingAttachment)?t.isPreviewable():void 0},d.prototype.updateAttributesForAttachment=function(t,e){return this.setDocument(this.document.updateAttributesForAttachment(t,e))},d.prototype.removeAttributeForAttachment=function(t,e){return this.setDocument(this.document.removeAttributeForAttachment(t,e))},d.prototype.breakFormattedBlock=function(t){var n,o,i,r,s;return o=t.document,n=t.block,r=t.startPosition,s=[r-1,r],n.getBlockBreakPosition()===t.startLocation.offset?(n.breaksOnReturn()&&"\n"===t.nextCharacter?r+=1:o=o.removeTextAtRange(s),s=[r,r]):"\n"===t.nextCharacter?"\n"===t.previousCharacter?s=[r-1,r+1]:(s=[r,r+1],r+=1):t.startLocation.offset-1!==0&&(r+=1),i=new e.Document([n.removeLastAttribute().copyWithoutText()]),this.setDocument(o.insertDocumentAtRange(i,s)),this.setSelection(r)},d.prototype.getPreviousBlock=function(){var t,e;return(e=this.getLocationRange())&&(t=e[0].index,t>0)?this.document.getBlockAtIndex(t-1):void 0},d.prototype.getBlock=function(){var t;return(t=this.getLocationRange())?this.document.getBlockAtIndex(t[0].index):void 0},d.prototype.getAttachmentAtRange=function(t){var n;return n=this.document.getDocumentAtRange(t),n.toString()===e.OBJECT_REPLACEMENT_CHARACTER+"\n"?n.getAttachments()[0]:void 0},d.prototype.notifyDelegateOfCurrentAttributesChange=function(){var t;return null!=(t=this.delegate)&&"function"==typeof t.compositionDidChangeCurrentAttributes?t.compositionDidChangeCurrentAttributes(this.currentAttributes):void 0},d.prototype.notifyDelegateOfInsertionAtRange=function(t){var e;return null!=(e=this.delegate)&&"function"==typeof e.compositionDidPerformInsertionAtRange?e.compositionDidPerformInsertionAtRange(t):void 0},d.prototype.translateUTF16PositionFromOffset=function(t,e){var n,o;return o=this.document.toUTF16String(),n=o.offsetFromUCS2Offset(t),o.offsetToUCS2Offset(n+e)},d}(e.BasicObject)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.UndoManager=function(e){function n(t){this.composition=t,this.undoEntries=[],this.redoEntries=[]}var o;return t(n,e),n.prototype.recordUndoEntry=function(t,e){var n,i,r,s,a;return s=null!=e?e:{},i=s.context,n=s.consolidatable,r=this.undoEntries.slice(-1)[0],n&&o(r,t,i)?void 0:(a=this.createEntry({description:t,context:i}),this.undoEntries.push(a),this.redoEntries=[])},n.prototype.undo=function(){var t,e;return(e=this.undoEntries.pop())?(t=this.createEntry(e),this.redoEntries.push(t),this.composition.loadSnapshot(e.snapshot)):void 0},n.prototype.redo=function(){var t,e;return(t=this.redoEntries.pop())?(e=this.createEntry(t),this.undoEntries.push(e),this.composition.loadSnapshot(t.snapshot)):void 0},n.prototype.canUndo=function(){return this.undoEntries.length>0},n.prototype.canRedo=function(){return this.redoEntries.length>0},n.prototype.createEntry=function(t){var e,n,o;return o=null!=t?t:{},n=o.description,e=o.context,{description:null!=n?n.toString():void 0,context:JSON.stringify(e),snapshot:this.composition.getSnapshot()}},o=function(t,e,n){return(null!=t?t.description:void 0)===(null!=e?e.toString():void 0)&&(null!=t?t.context:void 0)===JSON.stringify(n)},n}(e.BasicObject)}.call(this),function(){e.Editor=function(){function t(t,n,o){this.composition=t,this.selectionManager=n,this.element=o,this.undoManager=new e.UndoManager(this.composition)}return t.prototype.loadDocument=function(t){return this.loadSnapshot({document:t,selectedRange:[0,0]})},t.prototype.loadHTML=function(t){return null==t&&(t=""),this.loadDocument(e.Document.fromHTML(t,{referenceElement:this.element}))},t.prototype.loadJSON=function(t){var n,o;return n=t.document,o=t.selectedRange,n=e.Document.fromJSON(n),this.loadSnapshot({document:n,selectedRange:o})},t.prototype.loadSnapshot=function(t){return this.undoManager=new e.UndoManager(this.composition),this.composition.loadSnapshot(t)},t.prototype.getDocument=function(){return this.composition.document},t.prototype.getSelectedDocument=function(){return this.composition.getSelectedDocument()},t.prototype.getSnapshot=function(){return this.composition.getSnapshot()},t.prototype.toJSON=function(){return this.getSnapshot()},t.prototype.deleteInDirection=function(t){return this.composition.deleteInDirection(t)},t.prototype.insertAttachment=function(t){return this.composition.insertAttachment(t)},t.prototype.insertDocument=function(t){return this.composition.insertDocument(t)},t.prototype.insertFile=function(t){return this.composition.insertFile(t)},t.prototype.insertHTML=function(t){return this.composition.insertHTML(t)},t.prototype.insertString=function(t){return this.composition.insertString(t)},t.prototype.insertText=function(t){return this.composition.insertText(t)},t.prototype.insertLineBreak=function(){return this.composition.insertLineBreak()},t.prototype.getSelectedRange=function(){return this.composition.getSelectedRange()
},t.prototype.getPosition=function(){return this.composition.getPosition()},t.prototype.getClientRectAtPosition=function(t){var e;return e=this.getDocument().locationRangeFromRange([t,t+1]),this.selectionManager.getClientRectAtLocationRange(e)},t.prototype.expandSelectionInDirection=function(t){return this.composition.expandSelectionInDirection(t)},t.prototype.moveCursorInDirection=function(t){return this.composition.moveCursorInDirection(t)},t.prototype.setSelectedRange=function(t){return this.composition.setSelectedRange(t)},t.prototype.activateAttribute=function(t,e){return null==e&&(e=!0),this.composition.setCurrentAttribute(t,e)},t.prototype.attributeIsActive=function(t){return this.composition.hasCurrentAttribute(t)},t.prototype.canActivateAttribute=function(t){return this.composition.canSetCurrentAttribute(t)},t.prototype.deactivateAttribute=function(t){return this.composition.removeCurrentAttribute(t)},t.prototype.canDecreaseNestingLevel=function(){return this.composition.canDecreaseNestingLevel()},t.prototype.canIncreaseNestingLevel=function(){return this.composition.canIncreaseNestingLevel()},t.prototype.decreaseNestingLevel=function(){return this.canDecreaseNestingLevel()?this.composition.decreaseNestingLevel():void 0},t.prototype.increaseNestingLevel=function(){return this.canIncreaseNestingLevel()?this.composition.increaseNestingLevel():void 0},t.prototype.canDecreaseIndentationLevel=function(){return this.canDecreaseNestingLevel()},t.prototype.canIncreaseIndentationLevel=function(){return this.canIncreaseNestingLevel()},t.prototype.decreaseIndentationLevel=function(){return this.decreaseNestingLevel()},t.prototype.increaseIndentationLevel=function(){return this.increaseNestingLevel()},t.prototype.canRedo=function(){return this.undoManager.canRedo()},t.prototype.canUndo=function(){return this.undoManager.canUndo()},t.prototype.recordUndoEntry=function(t,e){var n,o,i;return i=null!=e?e:{},o=i.context,n=i.consolidatable,this.undoManager.recordUndoEntry(t,{context:o,consolidatable:n})},t.prototype.redo=function(){return this.canRedo()?this.undoManager.redo():void 0},t.prototype.undo=function(){return this.canUndo()?this.undoManager.undo():void 0},t}()}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.ManagedAttachment=function(e){function n(t,e){var n;this.attachmentManager=t,this.attachment=e,n=this.attachment,this.id=n.id,this.file=n.file}return t(n,e),n.prototype.remove=function(){return this.attachmentManager.requestRemovalOfAttachment(this.attachment)},n.proxyMethod("attachment.getAttribute"),n.proxyMethod("attachment.hasAttribute"),n.proxyMethod("attachment.setAttribute"),n.proxyMethod("attachment.getAttributes"),n.proxyMethod("attachment.setAttributes"),n.proxyMethod("attachment.isPending"),n.proxyMethod("attachment.isPreviewable"),n.proxyMethod("attachment.getURL"),n.proxyMethod("attachment.getHref"),n.proxyMethod("attachment.getFilename"),n.proxyMethod("attachment.getFilesize"),n.proxyMethod("attachment.getFormattedFilesize"),n.proxyMethod("attachment.getExtension"),n.proxyMethod("attachment.getContentType"),n.proxyMethod("attachment.getFile"),n.proxyMethod("attachment.setFile"),n.proxyMethod("attachment.releaseFile"),n.proxyMethod("attachment.getUploadProgress"),n.proxyMethod("attachment.setUploadProgress"),n}(e.BasicObject)}.call(this),function(){var t=function(t,e){function o(){this.constructor=t}for(var i in e)n.call(e,i)&&(t[i]=e[i]);return o.prototype=e.prototype,t.prototype=new o,t.__super__=e.prototype,t},n={}.hasOwnProperty;e.AttachmentManager=function(n){function o(t){var e,n,o;for(null==t&&(t=[]),this.managedAttachments={},n=0,o=t.length;o>n;n++)e=t[n],this.manageAttachment(e)}return t(o,n),o.prototype.getAttachments=function(){var t,e,n,o;n=this.managedAttachments,o=[];for(e in n)t=n[e],o.push(t);return o},o.prototype.manageAttachment=function(t){var n,o;return null!=(n=this.managedAttachments)[o=t.id]?n[o]:n[o]=new e.ManagedAttachment(this,t)},o.prototype.attachmentIsManaged=function(t){return t.id in this.managedAttachments},o.prototype.requestRemovalOfAttachment=function(t){var e;return this.attachmentIsManaged(t)&&null!=(e=this.delegate)&&"function"==typeof e.attachmentManagerDidRequestRemovalOfAttachment?e.attachmentManagerDidRequestRemovalOfAttachment(t):void 0},o.prototype.unmanageAttachment=function(t){var e;return e=this.managedAttachments[t.id],delete this.managedAttachments[t.id],e},o}(e.BasicObject)}.call(this),function(){var t,n,o,i,r,s,a,u,c,l,h;t=e.elementContainsNode,n=e.findChildIndexOfNode,r=e.nodeIsBlockStart,s=e.nodeIsBlockStartComment,i=e.nodeIsBlockContainer,a=e.nodeIsCursorTarget,u=e.nodeIsEmptyTextNode,c=e.nodeIsTextNode,o=e.nodeIsAttachmentElement,l=e.tagName,h=e.walkTree,e.LocationMapper=function(){function e(t){this.element=t}var p,d,f,g;return e.prototype.findLocationFromContainerAndOffset=function(e,o,i){var s,u,l,p,g,m,y;for(m=(null!=i?i:{strict:!0}).strict,u=0,l=!1,p={index:0,offset:0},(s=this.findAttachmentElementParentForNode(e))&&(e=s.parentNode,o=n(s)),y=h(this.element,{usingFilter:f});y.nextNode();){if(g=y.currentNode,g===e&&c(e)){a(g)||(p.offset+=o);break}if(g.parentNode===e){if(u++===o)break}else if(!t(e,g)&&u>0)break;r(g,{strict:m})?(l&&p.index++,p.offset=0,l=!0):p.offset+=d(g)}return p},e.prototype.findContainerAndOffsetFromLocation=function(t){var e,o,s,a,u,l;if(0===t.index&&0===t.offset){for(e=this.element,a=0;e.firstChild;)if(e=e.firstChild,i(e)){a=1;break}return[e,a]}if(u=this.findNodeAndOffsetFromLocation(t),o=u[0],s=u[1],o){if(c(o))e=o,l=o.textContent,a=t.offset-s;else{if(e=o.parentNode,!r(o.previousSibling)&&!i(e))for(;o===e.lastChild&&(o=e,e=e.parentNode,!i(e)););a=n(o),0!==t.offset&&a++}return[e,a]}},e.prototype.findNodeAndOffsetFromLocation=function(t){var e,n,o,i,r,s,u,l;for(u=0,l=this.getSignificantNodesForIndex(t.index),n=0,o=l.length;o>n;n++){if(e=l[n],i=d(e),t.offset<=u+i)if(c(e)){if(r=e,s=u,t.offset===s&&a(r))break}else r||(r=e,s=u);if(u+=i,u>t.offset)break}return[r,s]},e.prototype.findAttachmentElementParentForNode=function(t){for(;t&&t!==this.element;){if(o(t))return t;t=t.parentNode}},e.prototype.getSignificantNodesForIndex=function(t){var e,n,o,i,r;for(o=[],r=h(this.element,{usingFilter:p}),i=!1;r.nextNode();)if(n=r.currentNode,s(n)){if("undefined"!=typeof e&&null!==e?e++:e=0,e===t)i=!0;else if(i)break}else i&&o.push(n);return o},d=function(t){var e;return t.nodeType===Node.TEXT_NODE?a(t)?0:(e=t.textContent,e.length):"br"===l(t)||o(t)?1:0},p=function(t){return g(t)===NodeFilter.FILTER_ACCEPT?f(t):NodeFilter.FILTER_REJECT},g=function(t){return u(t)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},f=function(t){return o(t.parentNode)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},e}()}.call(this),function(){var t,n,o=[].slice;t=e.getDOMRange,n=e.setDOMRange,e.PointMapper=function(){function e(){}return e.prototype.createDOMRangeFromPoint=function(e){var o,i,r,s,a,u,c,l;if(c=e.x,l=e.y,document.caretPositionFromPoint)return a=document.caretPositionFromPoint(c,l),r=a.offsetNode,i=a.offset,o=document.createRange(),o.setStart(r,i),o;if(document.caretRangeFromPoint)return document.caretRangeFromPoint(c,l);if(document.body.createTextRange){s=t();try{u=document.body.createTextRange(),u.moveToPoint(c,l),u.select()}catch(h){}return o=t(),n(s),o}},e.prototype.getClientRectsForDOMRange=function(t){var e,n,i;return n=o.call(t.getClientRects()),i=n[0],e=n[n.length-1],[i,e]},e}()}.call(this),function(){var t,n=function(t,e){return function(){return t.apply(e,arguments)}},o=function(t,e){function n(){this.constructor=t}for(var o in e)i.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},i={}.hasOwnProperty,r=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=e.getDOMRange,e.SelectionChangeObserver=function(e){function i(){this.run=n(this.run,this),this.update=n(this.update,this),this.selectionManagers=[]}var s;return o(i,e),i.prototype.start=function(){return this.started?void 0:(this.started=!0,"onselectionchange"in document?document.addEventListener("selectionchange",this.update,!0):this.run())},i.prototype.stop=function(){return this.started?(this.started=!1,document.removeEventListener("selectionchange",this.update,!0)):void 0},i.prototype.registerSelectionManager=function(t){return r.call(this.selectionManagers,t)<0?(this.selectionManagers.push(t),this.start()):void 0},i.prototype.unregisterSelectionManager=function(t){var e;return this.selectionManagers=function(){var n,o,i,r;for(i=this.selectionManagers,r=[],n=0,o=i.length;o>n;n++)e=i[n],e!==t&&r.push(e);return r}.call(this),0===this.selectionManagers.length?this.stop():void 0},i.prototype.notifySelectionManagersOfSelectionChange=function(){var t,e,n,o,i;for(n=this.selectionManagers,o=[],t=0,e=n.length;e>t;t++)i=n[t],o.push(i.selectionDidChange());return o},i.prototype.update=function(){var e;return e=t(),s(e,this.domRange)?void 0:(this.domRange=e,this.notifySelectionManagersOfSelectionChange())},i.prototype.reset=function(){return this.domRange=null,this.update()},i.prototype.run=function(){return this.started?(this.update(),requestAnimationFrame(this.run)):void 0},s=function(t,e){return(null!=t?t.startContainer:void 0)===(null!=e?e.startContainer:void 0)&&(null!=t?t.startOffset:void 0)===(null!=e?e.startOffset:void 0)&&(null!=t?t.endContainer:void 0)===(null!=e?e.endContainer:void 0)&&(null!=t?t.endOffset:void 0)===(null!=e?e.endOffset:void 0)},i}(e.BasicObject),null==e.selectionChangeObserver&&(e.selectionChangeObserver=new e.SelectionChangeObserver)}.call(this),function(){var t,n,o,i,r,s,a,u,c,l,h=function(t,e){return function(){return t.apply(e,arguments)}},p=function(t,e){function n(){this.constructor=t}for(var o in e)d.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},d={}.hasOwnProperty;o=e.getDOMSelection,n=e.getDOMRange,l=e.setDOMRange,t=e.elementContainsNode,s=e.nodeIsCursorTarget,r=e.innerElementIsActive,i=e.handleEvent,a=e.normalizeRange,u=e.rangeIsCollapsed,c=e.rangesAreEqual,e.SelectionManager=function(d){function f(t){this.element=t,this.selectionDidChange=h(this.selectionDidChange,this),this.didMouseDown=h(this.didMouseDown,this),this.locationMapper=new e.LocationMapper(this.element),this.pointMapper=new e.PointMapper,this.lockCount=0,i("mousedown",{onElement:this.element,withCallback:this.didMouseDown})}return p(f,d),f.prototype.getLocationRange=function(t){var e,o;return null==t&&(t={}),e=t.strict===!1?this.createLocationRangeFromDOMRange(n(),{strict:!1}):t.ignoreLock?this.currentLocationRange:null!=(o=this.lockedLocationRange)?o:this.currentLocationRange},f.prototype.setLocationRange=function(t){var e;if(!this.lockedLocationRange)return t=a(t),(e=this.createDOMRangeFromLocationRange(t))?(l(e),this.updateCurrentLocationRange(t)):void 0},f.prototype.setLocationRangeFromPointRange=function(t){var e,n;return t=a(t),n=this.getLocationAtPoint(t[0]),e=this.getLocationAtPoint(t[1]),this.setLocationRange([n,e])},f.prototype.getClientRectAtLocationRange=function(t){var e;return(e=this.createDOMRangeFromLocationRange(t))?this.getClientRectsForDOMRange(e)[1]:void 0},f.prototype.locationIsCursorTarget=function(t){var e,n,o;return o=this.findNodeAndOffsetFromLocation(t),e=o[0],n=o[1],s(e)},f.prototype.lock=function(){return 0===this.lockCount++?(this.updateCurrentLocationRange(),this.lockedLocationRange=this.getLocationRange()):void 0},f.prototype.unlock=function(){var t;return 0===--this.lockCount&&(t=this.lockedLocationRange,this.lockedLocationRange=null,null!=t)?this.setLocationRange(t):void 0},f.prototype.clearSelection=function(){var t;return null!=(t=o())?t.removeAllRanges():void 0},f.prototype.selectionIsCollapsed=function(){var t;return(null!=(t=n())?t.collapsed:void 0)===!0},f.prototype.selectionIsExpanded=function(){return!this.selectionIsCollapsed()},f.proxyMethod("locationMapper.findLocationFromContainerAndOffset"),f.proxyMethod("locationMapper.findContainerAndOffsetFromLocation"),f.proxyMethod("locationMapper.findNodeAndOffsetFromLocation"),f.proxyMethod("pointMapper.createDOMRangeFromPoint"),f.proxyMethod("pointMapper.getClientRectsForDOMRange"),f.prototype.didMouseDown=function(){return this.pauseTemporarily()},f.prototype.pauseTemporarily=function(){var e,n,o,r;return this.paused=!0,n=function(e){return function(){var n,i,s;for(e.paused=!1,clearTimeout(r),i=0,s=o.length;s>i;i++)n=o[i],n.destroy();return t(document,e.element)?e.selectionDidChange():void 0}}(this),r=setTimeout(n,200),o=function(){var t,o,r,s;for(r=["mousemove","keydown"],s=[],t=0,o=r.length;o>t;t++)e=r[t],s.push(i(e,{onElement:document,withCallback:n}));return s}()},f.prototype.selectionDidChange=function(){return this.paused||r(this.element)?void 0:this.updateCurrentLocationRange()},f.prototype.updateCurrentLocationRange=function(t){var e;return(null!=t?t:t=this.createLocationRangeFromDOMRange(n()))&&!c(t,this.currentLocationRange)?(this.currentLocationRange=t,null!=(e=this.delegate)&&"function"==typeof e.locationRangeDidChange?e.locationRangeDidChange(this.currentLocationRange.slice(0)):void 0):void 0},f.prototype.createDOMRangeFromLocationRange=function(t){var e,n,o,i;return o=this.findContainerAndOffsetFromLocation(t[0]),n=u(t)?o:null!=(i=this.findContainerAndOffsetFromLocation(t[1]))?i:o,null!=o&&null!=n?(e=document.createRange(),e.setStart.apply(e,o),e.setEnd.apply(e,n),e):void 0},f.prototype.createLocationRangeFromDOMRange=function(t,e){var n,o;if(null!=t&&this.domRangeWithinElement(t)&&(o=this.findLocationFromContainerAndOffset(t.startContainer,t.startOffset,e)))return t.collapsed||(n=this.findLocationFromContainerAndOffset(t.endContainer,t.endOffset,e)),a([o,n])},f.prototype.getLocationAtPoint=function(t){var e,n;return(e=this.createDOMRangeFromPoint(t))&&null!=(n=this.createLocationRangeFromDOMRange(e))?n[0]:void 0},f.prototype.domRangeWithinElement=function(e){return e.collapsed?t(this.element,e.startContainer):t(this.element,e.startContainer)&&t(this.element,e.endContainer)},f}(e.BasicObject)}.call(this),function(){var t,n,o,i=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty,s=[].slice;n=e.rangeIsCollapsed,o=e.rangesAreEqual,t=e.objectsAreEqual,e.EditorController=function(r){function a(t){var n,o;this.editorElement=t.editorElement,n=t.document,o=t.html,this.selectionManager=new e.SelectionManager(this.editorElement),this.selectionManager.delegate=this,this.composition=new e.Composition,this.composition.delegate=this,this.attachmentManager=new e.AttachmentManager(this.composition.getAttachments()),this.attachmentManager.delegate=this,this.inputController=new e.InputController(this.editorElement),this.inputController.delegate=this,this.inputController.responder=this.composition,this.compositionController=new e.CompositionController(this.editorElement,this.composition),this.compositionController.delegate=this,this.toolbarController=new e.ToolbarController(this.editorElement.toolbarElement),this.toolbarController.delegate=this,this.editor=new e.Editor(this.composition,this.selectionManager,this.editorElement),null!=n?this.editor.loadDocument(n):this.editor.loadHTML(o)}return i(a,r),a.prototype.registerSelectionManager=function(){return e.selectionChangeObserver.registerSelectionManager(this.selectionManager)},a.prototype.unregisterSelectionManager=function(){return e.selectionChangeObserver.unregisterSelectionManager(this.selectionManager)},a.prototype.compositionDidChangeDocument=function(){return this.editorElement.notify("document-change"),this.handlingInput?void 0:this.render()},a.prototype.compositionDidChangeCurrentAttributes=function(t){return this.currentAttributes=t,this.toolbarController.updateAttributes(this.currentAttributes),this.updateCurrentActions(),this.editorElement.notify("attributes-change",{attributes:this.currentAttributes})},a.prototype.compositionDidPerformInsertionAtRange=function(t){return this.pasting?this.pastedRange=t:void 0},a.prototype.compositionShouldAcceptFile=function(t){return this.editorElement.notify("file-accept",{file:t})},a.prototype.compositionDidAddAttachment=function(t){var e;return e=this.attachmentManager.manageAttachment(t),this.editorElement.notify("attachment-add",{attachment:e})},a.prototype.compositionDidEditAttachment=function(t){var e;return this.compositionController.rerenderViewForObject(t),e=this.attachmentManager.manageAttachment(t),this.editorElement.notify("attachment-edit",{attachment:e}),this.editorElement.notify("change")},a.prototype.compositionDidChangeAttachmentPreviewURL=function(t){return this.compositionController.invalidateViewForObject(t),this.editorElement.notify("change")},a.prototype.compositionDidRemoveAttachment=function(t){var e;return e=this.attachmentManager.unmanageAttachment(t),this.editorElement.notify("attachment-remove",{attachment:e})},a.prototype.compositionDidStartEditingAttachment=function(t){return this.attachmentLocationRange=this.composition.document.getLocationRangeOfAttachment(t),this.compositionController.installAttachmentEditorForAttachment(t),this.selectionManager.setLocationRange(this.attachmentLocationRange)},a.prototype.compositionDidStopEditingAttachment=function(){return this.compositionController.uninstallAttachmentEditor(),this.attachmentLocationRange=null},a.prototype.compositionDidRequestChangingSelectionToLocationRange=function(t){return!this.loadingSnapshot||this.isFocused()?(this.requestedLocationRange=t,this.compositionRevisionWhenLocationRangeRequested=this.composition.revision,this.handlingInput?void 0:this.render()):void 0},a.prototype.compositionWillLoadSnapshot=function(){return this.loadingSnapshot=!0},a.prototype.compositionDidLoadSnapshot=function(){return this.compositionController.refreshViewCache(),this.render(),this.loadingSnapshot=!1},a.prototype.getSelectionManager=function(){return this.selectionManager},a.proxyMethod("getSelectionManager().setLocationRange"),a.proxyMethod("getSelectionManager().getLocationRange"),a.prototype.attachmentManagerDidRequestRemovalOfAttachment=function(t){return this.removeAttachment(t)},a.prototype.compositionControllerWillSyncDocumentView=function(){return this.inputController.editorWillSyncDocumentView(),this.selectionManager.lock(),this.selectionManager.clearSelection()},a.prototype.compositionControllerDidSyncDocumentView=function(){return this.inputController.editorDidSyncDocumentView(),this.selectionManager.unlock(),this.updateCurrentActions(),this.editorElement.notify("sync")},a.prototype.compositionControllerDidRender=function(){return null!=this.requestedLocationRange&&(this.compositionRevisionWhenLocationRangeRequested===this.composition.revision&&this.selectionManager.setLocationRange(this.requestedLocationRange),this.requestedLocationRange=null,this.compositionRevisionWhenLocationRangeRequested=null),this.renderedCompositionRevision!==this.composition.revision&&(this.composition.updateCurrentAttributes(),this.editorElement.notify("render")),this.renderedCompositionRevision=this.composition.revision},a.prototype.compositionControllerDidFocus=function(){return this.toolbarController.hideDialog(),this.editorElement.notify("focus")},a.prototype.compositionControllerDidBlur=function(){return this.editorElement.notify("blur")},a.prototype.compositionControllerDidSelectAttachment=function(t){return this.composition.editAttachment(t)},a.prototype.compositionControllerDidRequestDeselectingAttachment=function(t){var e,n;return e=null!=(n=this.attachmentLocationRange)?n:this.composition.document.getLocationRangeOfAttachment(t),this.selectionManager.setLocationRange(e[1])},a.prototype.compositionControllerWillUpdateAttachment=function(t){return this.editor.recordUndoEntry("Edit Attachment",{context:t.id,consolidatable:!0})},a.prototype.compositionControllerDidRequestRemovalOfAttachment=function(t){return this.removeAttachment(t)},a.prototype.inputControllerWillHandleInput=function(){return this.handlingInput=!0,this.requestedRender=!1},a.prototype.inputControllerDidRequestRender=function(){return this.requestedRender=!0},a.prototype.inputControllerDidHandleInput=function(){return this.handlingInput=!1,this.requestedRender?(this.requestedRender=!1,this.render()):void 0},a.prototype.inputControllerDidAllowUnhandledInput=function(){return this.editorElement.notify("change")},a.prototype.inputControllerDidRequestReparse=function(){return this.reparse()},a.prototype.inputControllerWillPerformTyping=function(){return this.recordTypingUndoEntry()},a.prototype.inputControllerWillCutText=function(){return this.editor.recordUndoEntry("Cut")},a.prototype.inputControllerWillPasteText=function(){return this.editor.recordUndoEntry("Paste"),this.pasting=!0},a.prototype.inputControllerDidPaste=function(t){var e;return e=this.pastedRange,this.pastedRange=null,this.pasting=null,this.editorElement.notify("paste",{pasteData:t,range:e})},a.prototype.inputControllerWillMoveText=function(){return this.editor.recordUndoEntry("Move")},a.prototype.inputControllerWillAttachFiles=function(){return this.editor.recordUndoEntry("Drop Files")},a.prototype.inputControllerDidReceiveKeyboardCommand=function(t){return this.toolbarController.applyKeyboardCommand(t)},a.prototype.inputControllerDidStartDrag=function(){return this.locationRangeBeforeDrag=this.selectionManager.getLocationRange()},a.prototype.inputControllerDidReceiveDragOverPoint=function(t){return this.selectionManager.setLocationRangeFromPointRange(t)},a.prototype.inputControllerDidCancelDrag=function(){return this.selectionManager.setLocationRange(this.locationRangeBeforeDrag),this.locationRangeBeforeDrag=null},a.prototype.locationRangeDidChange=function(t){return this.composition.updateCurrentAttributes(),this.updateCurrentActions(),this.attachmentLocationRange&&!o(this.attachmentLocationRange,t)&&this.composition.stopEditingAttachment(),this.editorElement.notify("selection-change")},a.prototype.toolbarDidClickButton=function(){return this.getLocationRange()?void 0:this.setLocationRange({index:0,offset:0})},a.prototype.toolbarDidInvokeAction=function(t){return this.invokeAction(t)},a.prototype.toolbarDidToggleAttribute=function(t){return this.recordFormattingUndoEntry(),this.composition.toggleCurrentAttribute(t),this.render(),this.selectionFrozen?void 0:this.editorElement.focus()},a.prototype.toolbarDidUpdateAttribute=function(t,e){return this.recordFormattingUndoEntry(),this.composition.setCurrentAttribute(t,e),this.render(),this.selectionFrozen?void 0:this.editorElement.focus()},a.prototype.toolbarDidRemoveAttribute=function(t){return this.recordFormattingUndoEntry(),this.composition.removeCurrentAttribute(t),this.render(),this.selectionFrozen?void 0:this.editorElement.focus()},a.prototype.toolbarWillShowDialog=function(){return this.composition.expandSelectionForEditing(),this.freezeSelection()},a.prototype.toolbarDidShowDialog=function(t){return this.editorElement.notify("toolbar-dialog-show",{dialogName:t})},a.prototype.toolbarDidHideDialog=function(t){return this.thawSelection(),this.editorElement.focus(),this.editorElement.notify("toolbar-dialog-hide",{dialogName:t})},a.prototype.freezeSelection=function(){return this.selectionFrozen?void 0:(this.selectionManager.lock(),this.composition.freezeSelection(),this.selectionFrozen=!0,this.render())},a.prototype.thawSelection=function(){return this.selectionFrozen?(this.composition.thawSelection(),this.selectionManager.unlock(),this.selectionFrozen=!1,this.render()):void 0},a.prototype.actions={undo:{test:function(){return this.editor.canUndo()},perform:function(){return this.editor.undo()}},redo:{test:function(){return this.editor.canRedo()},perform:function(){return this.editor.redo()}},link:{test:function(){return this.editor.canActivateAttribute("href")}},increaseNestingLevel:{test:function(){return this.editor.canIncreaseNestingLevel()},perform:function(){return this.editor.increaseNestingLevel()&&this.render()}},decreaseNestingLevel:{test:function(){return this.editor.canDecreaseNestingLevel()},perform:function(){return this.editor.decreaseNestingLevel()&&this.render()}},increaseBlockLevel:{test:function(){return this.editor.canIncreaseNestingLevel()},perform:function(){return this.editor.increaseNestingLevel()&&this.render()}},decreaseBlockLevel:{test:function(){return this.editor.canDecreaseNestingLevel()},perform:function(){return this.editor.decreaseNestingLevel()&&this.render()}}},a.prototype.canInvokeAction=function(t){var e,n;return this.actionIsExternal(t)?!0:!!(null!=(e=this.actions[t])&&null!=(n=e.test)?n.call(this):void 0)},a.prototype.invokeAction=function(t){var e,n;return this.actionIsExternal(t)?this.editorElement.notify("action-invoke",{actionName:t}):null!=(e=this.actions[t])&&null!=(n=e.perform)?n.call(this):void 0},a.prototype.actionIsExternal=function(t){return/^x-./.test(t)},a.prototype.getCurrentActions=function(){var t,e;e={};for(t in this.actions)e[t]=this.canInvokeAction(t);return e},a.prototype.updateCurrentActions=function(){var e;return e=this.getCurrentActions(),t(e,this.currentActions)?void 0:(this.currentActions=e,this.toolbarController.updateActions(this.currentActions),this.editorElement.notify("actions-change",{actions:this.currentActions}))},a.prototype.reparse=function(){return this.composition.replaceHTML(this.editorElement.innerHTML)},a.prototype.render=function(){return this.compositionController.render()},a.prototype.removeAttachment=function(t){return this.editor.recordUndoEntry("Delete Attachment"),this.composition.removeAttachment(t),this.render()},a.prototype.recordFormattingUndoEntry=function(){var t;return t=this.selectionManager.getLocationRange(),n(t)?void 0:this.editor.recordUndoEntry("Formatting",{context:this.getUndoContext(),consolidatable:!0})},a.prototype.recordTypingUndoEntry=function(){return this.editor.recordUndoEntry("Typing",{context:this.getUndoContext(this.currentAttributes),consolidatable:!0})},a.prototype.getUndoContext=function(){var t;return t=1<=arguments.length?s.call(arguments,0):[],[this.getLocationContext(),this.getTimeContext()].concat(s.call(t))},a.prototype.getLocationContext=function(){var t;return t=this.selectionManager.getLocationRange(),n(t)?t[0].index:t},a.prototype.getTimeContext=function(){return e.config.undoInterval>0?Math.floor((new Date).getTime()/e.config.undoInterval):0},a.prototype.isFocused=function(){var t;return this.editorElement===(null!=(t=this.editorElement.ownerDocument)?t.activeElement:void 0)},a}(e.Controller)}.call(this),function(){var t,n,o,i,r;i=e.makeElement,r=e.triggerEvent,n=e.handleEvent,o=e.handleEventOnce,t=e.AttachmentView.attachmentSelector,e.registerElement("trix-editor",function(){var s,a,u,c,l,h,p,d;return h=0,s=function(t){return!document.querySelector(":focus")&&t.hasAttribute("autofocus")&&document.querySelector("[autofocus]")===t?t.focus():void 0},p=function(t){return t.hasAttribute("contenteditable")?void 0:(t.setAttribute("contenteditable",""),o("focus",{onElement:t,withCallback:function(){return u(t)}}))},u=function(t){return l(t),d(t)},l=function(t){return("function"==typeof document.queryCommandSupported?document.queryCommandSupported("enableObjectResizing"):void 0)?(document.execCommand("enableObjectResizing",!1,!1),n("mscontrolselect",{onElement:t,preventDefault:!0})):void 0},d=function(){var t;return("function"==typeof document.queryCommandSupported?document.queryCommandSupported("DefaultParagraphSeparator"):void 0)&&(t=e.config.blockAttributes["default"].tagName,"div"===t||"p"===t)?document.execCommand("DefaultParagraphSeparator",!1,t):void 0},a=/Trident.*rv:11/.test(navigator.userAgent),c=function(){return a?{display:"inline",width:"auto"}:{display:"inline-block",width:"1px"}}(),{defaultCSS:"%t:empty:not(:focus)::before {\n  content: attr(placeholder);\n  color: graytext;\n}\n\n%t a[contenteditable=false] {\n  cursor: text;\n}\n\n%t img {\n  max-width: 100%;\n  height: auto;\n}\n\n%t "+t+" figcaption textarea {\n  resize: none;\n}\n\n%t "+t+" figcaption textarea.trix-autoresize-clone {\n  position: absolute;\n  left: -9999px;\n  max-height: 0px;\n}\n\n%t "+t+'[data-trix-mutable] figcaption:empty::before {\n  content: "'+e.config.lang.captionPrompt+'";\n  color: graytext;\n}\n\n%t [data-trix-cursor-target] {\n  display: '+c.display+" !important;\n  width: "+c.width+" !important;\n  padding: 0 !important;\n  margin: 0 !important;\n  border: none !important;\n}\n\n%t [data-trix-cursor-target=left] {\n  vertical-align: top !important;\n  margin-left: -1px !important;\n}\n\n%t [data-trix-cursor-target=right] {\n  vertical-align: bottom !important;\n  margin-right: -1px !important;\n}",trixId:{get:function(){return this.hasAttribute("trix-id")?this.getAttribute("trix-id"):(this.setAttribute("trix-id",++h),this.trixId)}},toolbarElement:{get:function(){var t,e,n;return this.hasAttribute("toolbar")?null!=(e=this.ownerDocument)?e.getElementById(this.getAttribute("toolbar")):void 0:this.parentNode?(n="trix-toolbar-"+this.trixId,this.setAttribute("toolbar",n),t=i("trix-toolbar",{id:n}),this.parentNode.insertBefore(t,this),t):void 0}},inputElement:{get:function(){var t,e,n;return this.hasAttribute("input")?null!=(n=this.ownerDocument)?n.getElementById(this.getAttribute("input")):void 0:this.parentNode?(e="trix-input-"+this.trixId,this.setAttribute("input",e),t=i("input",{type:"hidden",id:e}),this.parentNode.insertBefore(t,this.nextElementSibling),t):void 0}},editor:{get:function(){var t;return null!=(t=this.editorController)?t.editor:void 0}},name:{get:function(){var t;return null!=(t=this.inputElement)?t.name:void 0}},value:{get:function(){var t;return null!=(t=this.inputElement)?t.value:void 0},set:function(t){var e;return this.defaultValue=t,null!=(e=this.editor)?e.loadHTML(this.defaultValue):void 0}},notify:function(t,n){var o;switch(t){case"document-change":this.documentChangedSinceLastRender=!0;break;case"render":this.documentChangedSinceLastRender&&(this.documentChangedSinceLastRender=!1,this.notify("change"));break;case"change":case"attachment-add":case"attachment-edit":case"attachment-remove":null!=(o=this.inputElement)&&(o.value=e.serializeToContentType(this,"text/html"))}return this.editorController?r("trix-"+t,{onElement:this,attributes:n}):void 0},createdCallback:function(){return p(this)},attachedCallback:function(){return this.hasAttribute("data-trix-internal")?void 0:(null==this.editorController&&(this.editorController=new e.EditorController({editorElement:this,html:this.defaultValue=this.value})),this.editorController.registerSelectionManager(),this.registerResetListener(),s(this),requestAnimationFrame(function(t){return function(){return t.notify("initialize")}}(this)))},detachedCallback:function(){var t;return null!=(t=this.editorController)&&t.unregisterSelectionManager(),this.unregisterResetListener()},registerResetListener:function(){return this.resetListener=this.resetBubbled.bind(this),window.addEventListener("reset",this.resetListener,!1)},unregisterResetListener:function(){return window.removeEventListener("reset",this.resetListener,!1)},resetBubbled:function(t){var e;return t.target!==(null!=(e=this.inputElement)?e.form:void 0)||t.defaultPrevented?void 0:this.reset()},reset:function(){return this.value=this.defaultValue}}}())}.call(this),function(){}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}.call(this);
(function() {
  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(this);

  var ActionCable = this.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {
  $(function() {
    var deleteFile, sendFile;
    document.addEventListener('trix-attachment-add', function(event) {
      var attachment;
      attachment = event.attachment;
      if (attachment.file) {
        return sendFile(attachment);
      }
    });
    document.addEventListener('trix-attachment-remove', function(event) {
      var attachment;
      attachment = event.attachment;
      return deleteFile(attachment);
    });
    sendFile = function(attachment) {
      var file, form, xhr;
      file = attachment.file;
      form = new FormData;
      form.append('Content-Type', file.type);
      form.append('picture[image]', file);
      xhr = new XMLHttpRequest;
      xhr.open('POST', '/admin/pictures', true);
      xhr.upload.onprogress = function(event) {
        var progress;
        progress = void 0;
        progress = event.loaded / event.total * 100;
        return attachment.setUploadProgress(progress);
      };
      xhr.onload = function() {
        var response;
        response = JSON.parse(this.responseText);
        return attachment.setAttributes({
          url: response.url,
          picture_id: response.picture_id,
          href: response.url
        });
      };
      return xhr.send(form);
    };
    deleteFile = function(n) {
      return $.ajax({
        type: 'DELETE',
        url: '/admin/pictures/' + n.attachment.attributes.values.picture_id,
        cache: false,
        contentType: false,
        processData: false
      });
    };
  });

}).call(this);
/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): util.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */


var Util = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */

  var transition = false;

  var MAX_UID = 1000000;

  var TransitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
    transition: 'transitionend'
  };

  // shoutout AngusCroll (https://goo.gl/pxwQGp)
  function toType(obj) {
    return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function isElement(obj) {
    return (obj[0] || obj).nodeType;
  }

  function getSpecialTransitionEndEvent() {
    return {
      bindType: transition.end,
      delegateType: transition.end,
      handle: function handle(event) {
        if ($(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }
        return undefined;
      }
    };
  }

  function transitionEndTest() {
    if (window.QUnit) {
      return false;
    }

    var el = document.createElement('bootstrap');

    for (var name in TransitionEndEvent) {
      if (el.style[name] !== undefined) {
        return {
          end: TransitionEndEvent[name]
        };
      }
    }

    return false;
  }

  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false;

    $(this).one(Util.TRANSITION_END, function () {
      called = true;
    });

    setTimeout(function () {
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration);

    return this;
  }

  function setTransitionEndSupport() {
    transition = transitionEndTest();

    $.fn.emulateTransitionEnd = transitionEndEmulator;

    if (Util.supportsTransitionEnd()) {
      $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */

  var Util = {

    TRANSITION_END: 'bsTransitionEnd',

    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
      } while (document.getElementById(prefix));
      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      var selector = element.getAttribute('data-target');

      if (!selector) {
        selector = element.getAttribute('href') || '';
        selector = /^#[a-z]/i.test(selector) ? selector : null;
      }

      return selector;
    },
    reflow: function reflow(element) {
      return element.offsetHeight;
    },
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $(element).trigger(transition.end);
    },
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(transition);
    },
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      for (var property in configTypes) {
        if (configTypes.hasOwnProperty(property)) {
          var expectedTypes = configTypes[property];
          var value = config[property];
          var valueType = value && isElement(value) ? 'element' : toType(value);

          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new Error(componentName.toUpperCase() + ': ' + ('Option "' + property + '" provided type "' + valueType + '" ') + ('but expected type "' + expectedTypes + '".'));
          }
        }
      }
    }
  };

  setTransitionEndSupport();

  return Util;
}(jQuery);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): alert.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Alert = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'alert';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.alert';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 150;

  var Selector = {
    DISMISS: '[data-dismiss="alert"]'
  };

  var Event = {
    CLOSE: 'close' + EVENT_KEY,
    CLOSED: 'closed' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    ALERT: 'alert',
    FADE: 'fade',
    SHOW: 'show'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Alert = function () {
    function Alert(element) {
      _classCallCheck(this, Alert);

      this._element = element;
    }

    // getters

    // public

    Alert.prototype.close = function close(element) {
      element = element || this._element;

      var rootElement = this._getRootElement(element);
      var customEvent = this._triggerCloseEvent(rootElement);

      if (customEvent.isDefaultPrevented()) {
        return;
      }

      this._removeElement(rootElement);
    };

    Alert.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    };

    // private

    Alert.prototype._getRootElement = function _getRootElement(element) {
      var selector = Util.getSelectorFromElement(element);
      var parent = false;

      if (selector) {
        parent = $(selector)[0];
      }

      if (!parent) {
        parent = $(element).closest('.' + ClassName.ALERT)[0];
      }

      return parent;
    };

    Alert.prototype._triggerCloseEvent = function _triggerCloseEvent(element) {
      var closeEvent = $.Event(Event.CLOSE);

      $(element).trigger(closeEvent);
      return closeEvent;
    };

    Alert.prototype._removeElement = function _removeElement(element) {
      var _this = this;

      $(element).removeClass(ClassName.SHOW);

      if (!Util.supportsTransitionEnd() || !$(element).hasClass(ClassName.FADE)) {
        this._destroyElement(element);
        return;
      }

      $(element).one(Util.TRANSITION_END, function (event) {
        return _this._destroyElement(element, event);
      }).emulateTransitionEnd(TRANSITION_DURATION);
    };

    Alert.prototype._destroyElement = function _destroyElement(element) {
      $(element).detach().trigger(Event.CLOSED).remove();
    };

    // static

    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Alert(this);
          $element.data(DATA_KEY, data);
        }

        if (config === 'close') {
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        if (event) {
          event.preventDefault();
        }

        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }]);

    return Alert;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DISMISS, Alert._handleDismiss(new Alert()));

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Alert._jQueryInterface;
  $.fn[NAME].Constructor = Alert;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  return Alert;
}(jQuery);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): button.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Button = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'button';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.button';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];

  var ClassName = {
    ACTIVE: 'active',
    BUTTON: 'btn',
    FOCUS: 'focus'
  };

  var Selector = {
    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
    DATA_TOGGLE: '[data-toggle="buttons"]',
    INPUT: 'input',
    ACTIVE: '.active',
    BUTTON: '.btn'
  };

  var Event = {
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY,
    FOCUS_BLUR_DATA_API: 'focus' + EVENT_KEY + DATA_API_KEY + ' ' + ('blur' + EVENT_KEY + DATA_API_KEY)
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Button = function () {
    function Button(element) {
      _classCallCheck(this, Button);

      this._element = element;
    }

    // getters

    // public

    Button.prototype.toggle = function toggle() {
      var triggerChangeEvent = true;
      var rootElement = $(this._element).closest(Selector.DATA_TOGGLE)[0];

      if (rootElement) {
        var input = $(this._element).find(Selector.INPUT)[0];

        if (input) {
          if (input.type === 'radio') {
            if (input.checked && $(this._element).hasClass(ClassName.ACTIVE)) {
              triggerChangeEvent = false;
            } else {
              var activeElement = $(rootElement).find(Selector.ACTIVE)[0];

              if (activeElement) {
                $(activeElement).removeClass(ClassName.ACTIVE);
              }
            }
          }

          if (triggerChangeEvent) {
            input.checked = !$(this._element).hasClass(ClassName.ACTIVE);
            $(input).trigger('change');
          }

          input.focus();
        }
      }

      this._element.setAttribute('aria-pressed', !$(this._element).hasClass(ClassName.ACTIVE));

      if (triggerChangeEvent) {
        $(this._element).toggleClass(ClassName.ACTIVE);
      }
    };

    Button.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    };

    // static

    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);

        if (!data) {
          data = new Button(this);
          $(this).data(DATA_KEY, data);
        }

        if (config === 'toggle') {
          data[config]();
        }
      });
    };

    _createClass(Button, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }]);

    return Button;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE_CARROT, function (event) {
    event.preventDefault();

    var button = event.target;

    if (!$(button).hasClass(ClassName.BUTTON)) {
      button = $(button).closest(Selector.BUTTON);
    }

    Button._jQueryInterface.call($(button), 'toggle');
  }).on(Event.FOCUS_BLUR_DATA_API, Selector.DATA_TOGGLE_CARROT, function (event) {
    var button = $(event.target).closest(Selector.BUTTON)[0];
    $(button).toggleClass(ClassName.FOCUS, /^focus(in)?$/.test(event.type));
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Button._jQueryInterface;
  $.fn[NAME].Constructor = Button;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Button._jQueryInterface;
  };

  return Button;
}(jQuery);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): carousel.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Carousel = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'carousel';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.carousel';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 600;
  var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key
  var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

  var Default = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: 'hover',
    wrap: true
  };

  var DefaultType = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    slide: '(boolean|string)',
    pause: '(string|boolean)',
    wrap: 'boolean'
  };

  var Direction = {
    NEXT: 'next',
    PREV: 'prev',
    LEFT: 'left',
    RIGHT: 'right'
  };

  var Event = {
    SLIDE: 'slide' + EVENT_KEY,
    SLID: 'slid' + EVENT_KEY,
    KEYDOWN: 'keydown' + EVENT_KEY,
    MOUSEENTER: 'mouseenter' + EVENT_KEY,
    MOUSELEAVE: 'mouseleave' + EVENT_KEY,
    LOAD_DATA_API: 'load' + EVENT_KEY + DATA_API_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    CAROUSEL: 'carousel',
    ACTIVE: 'active',
    SLIDE: 'slide',
    RIGHT: 'carousel-item-right',
    LEFT: 'carousel-item-left',
    NEXT: 'carousel-item-next',
    PREV: 'carousel-item-prev',
    ITEM: 'carousel-item'
  };

  var Selector = {
    ACTIVE: '.active',
    ACTIVE_ITEM: '.active.carousel-item',
    ITEM: '.carousel-item',
    NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
    INDICATORS: '.carousel-indicators',
    DATA_SLIDE: '[data-slide], [data-slide-to]',
    DATA_RIDE: '[data-ride="carousel"]'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Carousel = function () {
    function Carousel(element, config) {
      _classCallCheck(this, Carousel);

      this._items = null;
      this._interval = null;
      this._activeElement = null;

      this._isPaused = false;
      this._isSliding = false;

      this._config = this._getConfig(config);
      this._element = $(element)[0];
      this._indicatorsElement = $(this._element).find(Selector.INDICATORS)[0];

      this._addEventListeners();
    }

    // getters

    // public

    Carousel.prototype.next = function next() {
      if (this._isSliding) {
        throw new Error('Carousel is sliding');
      }
      this._slide(Direction.NEXT);
    };

    Carousel.prototype.nextWhenVisible = function nextWhenVisible() {
      // Don't call next when the page isn't visible
      if (!document.hidden) {
        this.next();
      }
    };

    Carousel.prototype.prev = function prev() {
      if (this._isSliding) {
        throw new Error('Carousel is sliding');
      }
      this._slide(Direction.PREVIOUS);
    };

    Carousel.prototype.pause = function pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if ($(this._element).find(Selector.NEXT_PREV)[0] && Util.supportsTransitionEnd()) {
        Util.triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    };

    Carousel.prototype.cycle = function cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config.interval && !this._isPaused) {
        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
      }
    };

    Carousel.prototype.to = function to(index) {
      var _this = this;

      this._activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0];

      var activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        $(this._element).one(Event.SLID, function () {
          return _this.to(index);
        });
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      var direction = index > activeIndex ? Direction.NEXT : Direction.PREVIOUS;

      this._slide(direction, this._items[index]);
    };

    Carousel.prototype.dispose = function dispose() {
      $(this._element).off(EVENT_KEY);
      $.removeData(this._element, DATA_KEY);

      this._items = null;
      this._config = null;
      this._element = null;
      this._interval = null;
      this._isPaused = null;
      this._isSliding = null;
      this._activeElement = null;
      this._indicatorsElement = null;
    };

    // private

    Carousel.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    Carousel.prototype._addEventListeners = function _addEventListeners() {
      var _this2 = this;

      if (this._config.keyboard) {
        $(this._element).on(Event.KEYDOWN, function (event) {
          return _this2._keydown(event);
        });
      }

      if (this._config.pause === 'hover' && !('ontouchstart' in document.documentElement)) {
        $(this._element).on(Event.MOUSEENTER, function (event) {
          return _this2.pause(event);
        }).on(Event.MOUSELEAVE, function (event) {
          return _this2.cycle(event);
        });
      }
    };

    Carousel.prototype._keydown = function _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      switch (event.which) {
        case ARROW_LEFT_KEYCODE:
          event.preventDefault();
          this.prev();
          break;
        case ARROW_RIGHT_KEYCODE:
          event.preventDefault();
          this.next();
          break;
        default:
          return;
      }
    };

    Carousel.prototype._getItemIndex = function _getItemIndex(element) {
      this._items = $.makeArray($(element).parent().find(Selector.ITEM));
      return this._items.indexOf(element);
    };

    Carousel.prototype._getItemByDirection = function _getItemByDirection(direction, activeElement) {
      var isNextDirection = direction === Direction.NEXT;
      var isPrevDirection = direction === Direction.PREVIOUS;
      var activeIndex = this._getItemIndex(activeElement);
      var lastItemIndex = this._items.length - 1;
      var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

      if (isGoingToWrap && !this._config.wrap) {
        return activeElement;
      }

      var delta = direction === Direction.PREVIOUS ? -1 : 1;
      var itemIndex = (activeIndex + delta) % this._items.length;

      return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
    };

    Carousel.prototype._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
      var slideEvent = $.Event(Event.SLIDE, {
        relatedTarget: relatedTarget,
        direction: eventDirectionName
      });

      $(this._element).trigger(slideEvent);

      return slideEvent;
    };

    Carousel.prototype._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        $(this._indicatorsElement).find(Selector.ACTIVE).removeClass(ClassName.ACTIVE);

        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

        if (nextIndicator) {
          $(nextIndicator).addClass(ClassName.ACTIVE);
        }
      }
    };

    Carousel.prototype._slide = function _slide(direction, element) {
      var _this3 = this;

      var activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0];
      var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

      var isCycling = Boolean(this._interval);

      var directionalClassName = void 0;
      var orderClassName = void 0;
      var eventDirectionName = void 0;

      if (direction === Direction.NEXT) {
        directionalClassName = ClassName.LEFT;
        orderClassName = ClassName.NEXT;
        eventDirectionName = Direction.LEFT;
      } else {
        directionalClassName = ClassName.RIGHT;
        orderClassName = ClassName.PREV;
        eventDirectionName = Direction.RIGHT;
      }

      if (nextElement && $(nextElement).hasClass(ClassName.ACTIVE)) {
        this._isSliding = false;
        return;
      }

      var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);
      if (slideEvent.isDefaultPrevented()) {
        return;
      }

      if (!activeElement || !nextElement) {
        // some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      var slidEvent = $.Event(Event.SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName
      });

      if (Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.SLIDE)) {

        $(nextElement).addClass(orderClassName);

        Util.reflow(nextElement);

        $(activeElement).addClass(directionalClassName);
        $(nextElement).addClass(directionalClassName);

        $(activeElement).one(Util.TRANSITION_END, function () {
          $(nextElement).removeClass(directionalClassName + ' ' + orderClassName).addClass(ClassName.ACTIVE);

          $(activeElement).removeClass(ClassName.ACTIVE + ' ' + orderClassName + ' ' + directionalClassName);

          _this3._isSliding = false;

          setTimeout(function () {
            return $(_this3._element).trigger(slidEvent);
          }, 0);
        }).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        $(activeElement).removeClass(ClassName.ACTIVE);
        $(nextElement).addClass(ClassName.ACTIVE);

        this._isSliding = false;
        $(this._element).trigger(slidEvent);
      }

      if (isCycling) {
        this.cycle();
      }
    };

    // static

    Carousel._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = $.extend({}, Default, $(this).data());

        if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
          $.extend(_config, config);
        }

        var action = typeof config === 'string' ? config : _config.slide;

        if (!data) {
          data = new Carousel(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'number') {
          data.to(config);
        } else if (typeof action === 'string') {
          if (data[action] === undefined) {
            throw new Error('No method named "' + action + '"');
          }
          data[action]();
        } else if (_config.interval) {
          data.pause();
          data.cycle();
        }
      });
    };

    Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
      var selector = Util.getSelectorFromElement(this);

      if (!selector) {
        return;
      }

      var target = $(selector)[0];

      if (!target || !$(target).hasClass(ClassName.CAROUSEL)) {
        return;
      }

      var config = $.extend({}, $(target).data(), $(this).data());
      var slideIndex = this.getAttribute('data-slide-to');

      if (slideIndex) {
        config.interval = false;
      }

      Carousel._jQueryInterface.call($(target), config);

      if (slideIndex) {
        $(target).data(DATA_KEY).to(slideIndex);
      }

      event.preventDefault();
    };

    _createClass(Carousel, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return Carousel;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler);

  $(window).on(Event.LOAD_DATA_API, function () {
    $(Selector.DATA_RIDE).each(function () {
      var $carousel = $(this);
      Carousel._jQueryInterface.call($carousel, $carousel.data());
    });
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Carousel._jQueryInterface;
  $.fn[NAME].Constructor = Carousel;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Carousel._jQueryInterface;
  };

  return Carousel;
}(jQuery);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): collapse.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Collapse = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'collapse';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.collapse';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 600;

  var Default = {
    toggle: true,
    parent: ''
  };

  var DefaultType = {
    toggle: 'boolean',
    parent: 'string'
  };

  var Event = {
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };

  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };

  var Selector = {
    ACTIVES: '.card > .show, .card > .collapsing',
    DATA_TOGGLE: '[data-toggle="collapse"]'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Collapse = function () {
    function Collapse(element, config) {
      _classCallCheck(this, Collapse);

      this._isTransitioning = false;
      this._element = element;
      this._config = this._getConfig(config);
      this._triggerArray = $.makeArray($('[data-toggle="collapse"][href="#' + element.id + '"],' + ('[data-toggle="collapse"][data-target="#' + element.id + '"]')));

      this._parent = this._config.parent ? this._getParent() : null;

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      }

      if (this._config.toggle) {
        this.toggle();
      }
    }

    // getters

    // public

    Collapse.prototype.toggle = function toggle() {
      if ($(this._element).hasClass(ClassName.SHOW)) {
        this.hide();
      } else {
        this.show();
      }
    };

    Collapse.prototype.show = function show() {
      var _this = this;

      if (this._isTransitioning) {
        throw new Error('Collapse is transitioning');
      }

      if ($(this._element).hasClass(ClassName.SHOW)) {
        return;
      }

      var actives = void 0;
      var activesData = void 0;

      if (this._parent) {
        actives = $.makeArray($(this._parent).find(Selector.ACTIVES));
        if (!actives.length) {
          actives = null;
        }
      }

      if (actives) {
        activesData = $(actives).data(DATA_KEY);
        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      var startEvent = $.Event(Event.SHOW);
      $(this._element).trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
        return;
      }

      if (actives) {
        Collapse._jQueryInterface.call($(actives), 'hide');
        if (!activesData) {
          $(actives).data(DATA_KEY, null);
        }
      }

      var dimension = this._getDimension();

      $(this._element).removeClass(ClassName.COLLAPSE).addClass(ClassName.COLLAPSING);

      this._element.style[dimension] = 0;
      this._element.setAttribute('aria-expanded', true);

      if (this._triggerArray.length) {
        $(this._triggerArray).removeClass(ClassName.COLLAPSED).attr('aria-expanded', true);
      }

      this.setTransitioning(true);

      var complete = function complete() {
        $(_this._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).addClass(ClassName.SHOW);

        _this._element.style[dimension] = '';

        _this.setTransitioning(false);

        $(_this._element).trigger(Event.SHOWN);
      };

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = 'scroll' + capitalizedDimension;

      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);

      this._element.style[dimension] = this._element[scrollSize] + 'px';
    };

    Collapse.prototype.hide = function hide() {
      var _this2 = this;

      if (this._isTransitioning) {
        throw new Error('Collapse is transitioning');
      }

      if (!$(this._element).hasClass(ClassName.SHOW)) {
        return;
      }

      var startEvent = $.Event(Event.HIDE);
      $(this._element).trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
        return;
      }

      var dimension = this._getDimension();
      var offsetDimension = dimension === Dimension.WIDTH ? 'offsetWidth' : 'offsetHeight';

      this._element.style[dimension] = this._element[offsetDimension] + 'px';

      Util.reflow(this._element);

      $(this._element).addClass(ClassName.COLLAPSING).removeClass(ClassName.COLLAPSE).removeClass(ClassName.SHOW);

      this._element.setAttribute('aria-expanded', false);

      if (this._triggerArray.length) {
        $(this._triggerArray).addClass(ClassName.COLLAPSED).attr('aria-expanded', false);
      }

      this.setTransitioning(true);

      var complete = function complete() {
        _this2.setTransitioning(false);
        $(_this2._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).trigger(Event.HIDDEN);
      };

      this._element.style[dimension] = '';

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
    };

    Collapse.prototype.setTransitioning = function setTransitioning(isTransitioning) {
      this._isTransitioning = isTransitioning;
    };

    Collapse.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);

      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    };

    // private

    Collapse.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);
      config.toggle = Boolean(config.toggle); // coerce string values
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    Collapse.prototype._getDimension = function _getDimension() {
      var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
      return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
    };

    Collapse.prototype._getParent = function _getParent() {
      var _this3 = this;

      var parent = $(this._config.parent)[0];
      var selector = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';

      $(parent).find(selector).each(function (i, element) {
        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
      });

      return parent;
    };

    Collapse.prototype._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
      if (element) {
        var isOpen = $(element).hasClass(ClassName.SHOW);
        element.setAttribute('aria-expanded', isOpen);

        if (triggerArray.length) {
          $(triggerArray).toggleClass(ClassName.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
        }
      }
    };

    // static

    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      var selector = Util.getSelectorFromElement(element);
      return selector ? $(selector)[0] : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY);
        var _config = $.extend({}, Default, $this.data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

        if (!data && _config.toggle && /show|hide/.test(config)) {
          _config.toggle = false;
        }

        if (!data) {
          data = new Collapse(this, _config);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return Collapse;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    event.preventDefault();

    var target = Collapse._getTargetFromElement(this);
    var data = $(target).data(DATA_KEY);
    var config = data ? 'toggle' : $(this).data();

    Collapse._jQueryInterface.call($(target), config);
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Collapse._jQueryInterface;
  $.fn[NAME].Constructor = Collapse;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Collapse._jQueryInterface;
  };

  return Collapse;
}(jQuery);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): dropdown.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Dropdown = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'dropdown';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.dropdown';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key
  var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key
  var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key
  var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    CLICK: 'click' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY,
    FOCUSIN_DATA_API: 'focusin' + EVENT_KEY + DATA_API_KEY,
    KEYDOWN_DATA_API: 'keydown' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    BACKDROP: 'dropdown-backdrop',
    DISABLED: 'disabled',
    SHOW: 'show'
  };

  var Selector = {
    BACKDROP: '.dropdown-backdrop',
    DATA_TOGGLE: '[data-toggle="dropdown"]',
    FORM_CHILD: '.dropdown form',
    ROLE_MENU: '[role="menu"]',
    ROLE_LISTBOX: '[role="listbox"]',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '[role="menu"] li:not(.disabled) a, ' + '[role="listbox"] li:not(.disabled) a'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Dropdown = function () {
    function Dropdown(element) {
      _classCallCheck(this, Dropdown);

      this._element = element;

      this._addEventListeners();
    }

    // getters

    // public

    Dropdown.prototype.toggle = function toggle() {
      if (this.disabled || $(this).hasClass(ClassName.DISABLED)) {
        return false;
      }

      var parent = Dropdown._getParentFromElement(this);
      var isActive = $(parent).hasClass(ClassName.SHOW);

      Dropdown._clearMenus();

      if (isActive) {
        return false;
      }

      if ('ontouchstart' in document.documentElement && !$(parent).closest(Selector.NAVBAR_NAV).length) {

        // if mobile we use a backdrop because click events don't delegate
        var dropdown = document.createElement('div');
        dropdown.className = ClassName.BACKDROP;
        $(dropdown).insertBefore(this);
        $(dropdown).on('click', Dropdown._clearMenus);
      }

      var relatedTarget = {
        relatedTarget: this
      };
      var showEvent = $.Event(Event.SHOW, relatedTarget);

      $(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return false;
      }

      this.focus();
      this.setAttribute('aria-expanded', true);

      $(parent).toggleClass(ClassName.SHOW);
      $(parent).trigger($.Event(Event.SHOWN, relatedTarget));

      return false;
    };

    Dropdown.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      $(this._element).off(EVENT_KEY);
      this._element = null;
    };

    // private

    Dropdown.prototype._addEventListeners = function _addEventListeners() {
      $(this._element).on(Event.CLICK, this.toggle);
    };

    // static

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);

        if (!data) {
          data = new Dropdown(this);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config].call(this);
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      if (event && event.which === RIGHT_MOUSE_BUTTON_WHICH) {
        return;
      }

      var backdrop = $(Selector.BACKDROP)[0];
      if (backdrop) {
        backdrop.parentNode.removeChild(backdrop);
      }

      var toggles = $.makeArray($(Selector.DATA_TOGGLE));

      for (var i = 0; i < toggles.length; i++) {
        var parent = Dropdown._getParentFromElement(toggles[i]);
        var relatedTarget = {
          relatedTarget: toggles[i]
        };

        if (!$(parent).hasClass(ClassName.SHOW)) {
          continue;
        }

        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'focusin') && $.contains(parent, event.target)) {
          continue;
        }

        var hideEvent = $.Event(Event.HIDE, relatedTarget);
        $(parent).trigger(hideEvent);
        if (hideEvent.isDefaultPrevented()) {
          continue;
        }

        toggles[i].setAttribute('aria-expanded', 'false');

        $(parent).removeClass(ClassName.SHOW).trigger($.Event(Event.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      var parent = void 0;
      var selector = Util.getSelectorFromElement(element);

      if (selector) {
        parent = $(selector)[0];
      }

      return parent || element.parentNode;
    };

    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      if (!/(38|40|27|32)/.test(event.which) || /input|textarea/i.test(event.target.tagName)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (this.disabled || $(this).hasClass(ClassName.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this);
      var isActive = $(parent).hasClass(ClassName.SHOW);

      if (!isActive && event.which !== ESCAPE_KEYCODE || isActive && event.which === ESCAPE_KEYCODE) {

        if (event.which === ESCAPE_KEYCODE) {
          var toggle = $(parent).find(Selector.DATA_TOGGLE)[0];
          $(toggle).trigger('focus');
        }

        $(this).trigger('click');
        return;
      }

      var items = $(parent).find(Selector.VISIBLE_ITEMS).get();

      if (!items.length) {
        return;
      }

      var index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // up
        index--;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // down
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
    };

    _createClass(Dropdown, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }]);

    return Dropdown;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.KEYDOWN_DATA_API, Selector.DATA_TOGGLE, Dropdown._dataApiKeydownHandler).on(Event.KEYDOWN_DATA_API, Selector.ROLE_MENU, Dropdown._dataApiKeydownHandler).on(Event.KEYDOWN_DATA_API, Selector.ROLE_LISTBOX, Dropdown._dataApiKeydownHandler).on(Event.CLICK_DATA_API + ' ' + Event.FOCUSIN_DATA_API, Dropdown._clearMenus).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, Dropdown.prototype.toggle).on(Event.CLICK_DATA_API, Selector.FORM_CHILD, function (e) {
    e.stopPropagation();
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Dropdown._jQueryInterface;
  $.fn[NAME].Constructor = Dropdown;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Dropdown._jQueryInterface;
  };

  return Dropdown;
}(jQuery);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): modal.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Modal = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'modal';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.modal';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 300;
  var BACKDROP_TRANSITION_DURATION = 150;
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

  var Default = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true
  };

  var DefaultType = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean',
    show: 'boolean'
  };

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    FOCUSIN: 'focusin' + EVENT_KEY,
    RESIZE: 'resize' + EVENT_KEY,
    CLICK_DISMISS: 'click.dismiss' + EVENT_KEY,
    KEYDOWN_DISMISS: 'keydown.dismiss' + EVENT_KEY,
    MOUSEUP_DISMISS: 'mouseup.dismiss' + EVENT_KEY,
    MOUSEDOWN_DISMISS: 'mousedown.dismiss' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
    BACKDROP: 'modal-backdrop',
    OPEN: 'modal-open',
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    DIALOG: '.modal-dialog',
    DATA_TOGGLE: '[data-toggle="modal"]',
    DATA_DISMISS: '[data-dismiss="modal"]',
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Modal = function () {
    function Modal(element, config) {
      _classCallCheck(this, Modal);

      this._config = this._getConfig(config);
      this._element = element;
      this._dialog = $(element).find(Selector.DIALOG)[0];
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._originalBodyPadding = 0;
      this._scrollbarWidth = 0;
    }

    // getters

    // public

    Modal.prototype.toggle = function toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    Modal.prototype.show = function show(relatedTarget) {
      var _this = this;

      if (this._isTransitioning) {
        throw new Error('Modal is transitioning');
      }

      if (Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE)) {
        this._isTransitioning = true;
      }
      var showEvent = $.Event(Event.SHOW, {
        relatedTarget: relatedTarget
      });

      $(this._element).trigger(showEvent);

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = true;

      this._checkScrollbar();
      this._setScrollbar();

      $(document.body).addClass(ClassName.OPEN);

      this._setEscapeEvent();
      this._setResizeEvent();

      $(this._element).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
        return _this.hide(event);
      });

      $(this._dialog).on(Event.MOUSEDOWN_DISMISS, function () {
        $(_this._element).one(Event.MOUSEUP_DISMISS, function (event) {
          if ($(event.target).is(_this._element)) {
            _this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(function () {
        return _this._showElement(relatedTarget);
      });
    };

    Modal.prototype.hide = function hide(event) {
      var _this2 = this;

      if (event) {
        event.preventDefault();
      }

      if (this._isTransitioning) {
        throw new Error('Modal is transitioning');
      }

      var transition = Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE);
      if (transition) {
        this._isTransitioning = true;
      }

      var hideEvent = $.Event(Event.HIDE);
      $(this._element).trigger(hideEvent);

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = false;

      this._setEscapeEvent();
      this._setResizeEvent();

      $(document).off(Event.FOCUSIN);

      $(this._element).removeClass(ClassName.SHOW);

      $(this._element).off(Event.CLICK_DISMISS);
      $(this._dialog).off(Event.MOUSEDOWN_DISMISS);

      if (transition) {
        $(this._element).one(Util.TRANSITION_END, function (event) {
          return _this2._hideModal(event);
        }).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        this._hideModal();
      }
    };

    Modal.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);

      $(window, document, this._element, this._backdrop).off(EVENT_KEY);

      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._originalBodyPadding = null;
      this._scrollbarWidth = null;
    };

    // private

    Modal.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    Modal.prototype._showElement = function _showElement(relatedTarget) {
      var _this3 = this;

      var transition = Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // don't move modals dom position
        document.body.appendChild(this._element);
      }

      this._element.style.display = 'block';
      this._element.removeAttribute('aria-hidden');
      this._element.scrollTop = 0;

      if (transition) {
        Util.reflow(this._element);
      }

      $(this._element).addClass(ClassName.SHOW);

      if (this._config.focus) {
        this._enforceFocus();
      }

      var shownEvent = $.Event(Event.SHOWN, {
        relatedTarget: relatedTarget
      });

      var transitionComplete = function transitionComplete() {
        if (_this3._config.focus) {
          _this3._element.focus();
        }
        _this3._isTransitioning = false;
        $(_this3._element).trigger(shownEvent);
      };

      if (transition) {
        $(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        transitionComplete();
      }
    };

    Modal.prototype._enforceFocus = function _enforceFocus() {
      var _this4 = this;

      $(document).off(Event.FOCUSIN) // guard against infinite focus loop
      .on(Event.FOCUSIN, function (event) {
        if (document !== event.target && _this4._element !== event.target && !$(_this4._element).has(event.target).length) {
          _this4._element.focus();
        }
      });
    };

    Modal.prototype._setEscapeEvent = function _setEscapeEvent() {
      var _this5 = this;

      if (this._isShown && this._config.keyboard) {
        $(this._element).on(Event.KEYDOWN_DISMISS, function (event) {
          if (event.which === ESCAPE_KEYCODE) {
            _this5.hide();
          }
        });
      } else if (!this._isShown) {
        $(this._element).off(Event.KEYDOWN_DISMISS);
      }
    };

    Modal.prototype._setResizeEvent = function _setResizeEvent() {
      var _this6 = this;

      if (this._isShown) {
        $(window).on(Event.RESIZE, function (event) {
          return _this6._handleUpdate(event);
        });
      } else {
        $(window).off(Event.RESIZE);
      }
    };

    Modal.prototype._hideModal = function _hideModal() {
      var _this7 = this;

      this._element.style.display = 'none';
      this._element.setAttribute('aria-hidden', 'true');
      this._isTransitioning = false;
      this._showBackdrop(function () {
        $(document.body).removeClass(ClassName.OPEN);
        _this7._resetAdjustments();
        _this7._resetScrollbar();
        $(_this7._element).trigger(Event.HIDDEN);
      });
    };

    Modal.prototype._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        $(this._backdrop).remove();
        this._backdrop = null;
      }
    };

    Modal.prototype._showBackdrop = function _showBackdrop(callback) {
      var _this8 = this;

      var animate = $(this._element).hasClass(ClassName.FADE) ? ClassName.FADE : '';

      if (this._isShown && this._config.backdrop) {
        var doAnimate = Util.supportsTransitionEnd() && animate;

        this._backdrop = document.createElement('div');
        this._backdrop.className = ClassName.BACKDROP;

        if (animate) {
          $(this._backdrop).addClass(animate);
        }

        $(this._backdrop).appendTo(document.body);

        $(this._element).on(Event.CLICK_DISMISS, function (event) {
          if (_this8._ignoreBackdropClick) {
            _this8._ignoreBackdropClick = false;
            return;
          }
          if (event.target !== event.currentTarget) {
            return;
          }
          if (_this8._config.backdrop === 'static') {
            _this8._element.focus();
          } else {
            _this8.hide();
          }
        });

        if (doAnimate) {
          Util.reflow(this._backdrop);
        }

        $(this._backdrop).addClass(ClassName.SHOW);

        if (!callback) {
          return;
        }

        if (!doAnimate) {
          callback();
          return;
        }

        $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
      } else if (!this._isShown && this._backdrop) {
        $(this._backdrop).removeClass(ClassName.SHOW);

        var callbackRemove = function callbackRemove() {
          _this8._removeBackdrop();
          if (callback) {
            callback();
          }
        };

        if (Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE)) {
          $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
        } else {
          callbackRemove();
        }
      } else if (callback) {
        callback();
      }
    };

    // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------

    Modal.prototype._handleUpdate = function _handleUpdate() {
      this._adjustDialog();
    };

    Modal.prototype._adjustDialog = function _adjustDialog() {
      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      if (!this._isBodyOverflowing && isModalOverflowing) {
        this._element.style.paddingLeft = this._scrollbarWidth + 'px';
      }

      if (this._isBodyOverflowing && !isModalOverflowing) {
        this._element.style.paddingRight = this._scrollbarWidth + 'px';
      }
    };

    Modal.prototype._resetAdjustments = function _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    };

    Modal.prototype._checkScrollbar = function _checkScrollbar() {
      this._isBodyOverflowing = document.body.clientWidth < window.innerWidth;
      this._scrollbarWidth = this._getScrollbarWidth();
    };

    Modal.prototype._setScrollbar = function _setScrollbar() {
      var bodyPadding = parseInt($(Selector.FIXED_CONTENT).css('padding-right') || 0, 10);

      this._originalBodyPadding = document.body.style.paddingRight || '';

      if (this._isBodyOverflowing) {
        document.body.style.paddingRight = bodyPadding + this._scrollbarWidth + 'px';
      }
    };

    Modal.prototype._resetScrollbar = function _resetScrollbar() {
      document.body.style.paddingRight = this._originalBodyPadding;
    };

    Modal.prototype._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      var scrollDiv = document.createElement('div');
      scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    };

    // static

    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = $.extend({}, Modal.Default, $(this).data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

        if (!data) {
          data = new Modal(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config](relatedTarget);
        } else if (_config.show) {
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return Modal;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    var _this9 = this;

    var target = void 0;
    var selector = Util.getSelectorFromElement(this);

    if (selector) {
      target = $(selector)[0];
    }

    var config = $(target).data(DATA_KEY) ? 'toggle' : $.extend({}, $(target).data(), $(this).data());

    if (this.tagName === 'A' || this.tagName === 'AREA') {
      event.preventDefault();
    }

    var $target = $(target).one(Event.SHOW, function (showEvent) {
      if (showEvent.isDefaultPrevented()) {
        // only register focus restorer if modal will actually get shown
        return;
      }

      $target.one(Event.HIDDEN, function () {
        if ($(_this9).is(':visible')) {
          _this9.focus();
        }
      });
    });

    Modal._jQueryInterface.call($(target), config, this);
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Modal._jQueryInterface;
  $.fn[NAME].Constructor = Modal;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Modal._jQueryInterface;
  };

  return Modal;
}(jQuery);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): scrollspy.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var ScrollSpy = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'scrollspy';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.scrollspy';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];

  var Default = {
    offset: 10,
    method: 'auto',
    target: ''
  };

  var DefaultType = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };

  var Event = {
    ACTIVATE: 'activate' + EVENT_KEY,
    SCROLL: 'scroll' + EVENT_KEY,
    LOAD_DATA_API: 'load' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    DROPDOWN_ITEM: 'dropdown-item',
    DROPDOWN_MENU: 'dropdown-menu',
    NAV_LINK: 'nav-link',
    NAV: 'nav',
    ACTIVE: 'active'
  };

  var Selector = {
    DATA_SPY: '[data-spy="scroll"]',
    ACTIVE: '.active',
    LIST_ITEM: '.list-item',
    LI: 'li',
    LI_DROPDOWN: 'li.dropdown',
    NAV_LINKS: '.nav-link',
    DROPDOWN: '.dropdown',
    DROPDOWN_ITEMS: '.dropdown-item',
    DROPDOWN_TOGGLE: '.dropdown-toggle'
  };

  var OffsetMethod = {
    OFFSET: 'offset',
    POSITION: 'position'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var ScrollSpy = function () {
    function ScrollSpy(element, config) {
      var _this = this;

      _classCallCheck(this, ScrollSpy);

      this._element = element;
      this._scrollElement = element.tagName === 'BODY' ? window : element;
      this._config = this._getConfig(config);
      this._selector = this._config.target + ' ' + Selector.NAV_LINKS + ',' + (this._config.target + ' ' + Selector.DROPDOWN_ITEMS);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;

      $(this._scrollElement).on(Event.SCROLL, function (event) {
        return _this._process(event);
      });

      this.refresh();
      this._process();
    }

    // getters

    // public

    ScrollSpy.prototype.refresh = function refresh() {
      var _this2 = this;

      var autoMethod = this._scrollElement !== this._scrollElement.window ? OffsetMethod.POSITION : OffsetMethod.OFFSET;

      var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;

      var offsetBase = offsetMethod === OffsetMethod.POSITION ? this._getScrollTop() : 0;

      this._offsets = [];
      this._targets = [];

      this._scrollHeight = this._getScrollHeight();

      var targets = $.makeArray($(this._selector));

      targets.map(function (element) {
        var target = void 0;
        var targetSelector = Util.getSelectorFromElement(element);

        if (targetSelector) {
          target = $(targetSelector)[0];
        }

        if (target && (target.offsetWidth || target.offsetHeight)) {
          // todo (fat): remove sketch reliance on jQuery position/offset
          return [$(target)[offsetMethod]().top + offsetBase, targetSelector];
        }
        return null;
      }).filter(function (item) {
        return item;
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).forEach(function (item) {
        _this2._offsets.push(item[0]);
        _this2._targets.push(item[1]);
      });
    };

    ScrollSpy.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      $(this._scrollElement).off(EVENT_KEY);

      this._element = null;
      this._scrollElement = null;
      this._config = null;
      this._selector = null;
      this._offsets = null;
      this._targets = null;
      this._activeTarget = null;
      this._scrollHeight = null;
    };

    // private

    ScrollSpy.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);

      if (typeof config.target !== 'string') {
        var id = $(config.target).attr('id');
        if (!id) {
          id = Util.getUID(NAME);
          $(config.target).attr('id', id);
        }
        config.target = '#' + id;
      }

      Util.typeCheckConfig(NAME, config, DefaultType);

      return config;
    };

    ScrollSpy.prototype._getScrollTop = function _getScrollTop() {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    };

    ScrollSpy.prototype._getScrollHeight = function _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    };

    ScrollSpy.prototype._getOffsetHeight = function _getOffsetHeight() {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.offsetHeight;
    };

    ScrollSpy.prototype._process = function _process() {
      var scrollTop = this._getScrollTop() + this._config.offset;
      var scrollHeight = this._getScrollHeight();
      var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        var target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }
        return;
      }

      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        this._activeTarget = null;
        this._clear();
        return;
      }

      for (var i = this._offsets.length; i--;) {
        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (this._offsets[i + 1] === undefined || scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    };

    ScrollSpy.prototype._activate = function _activate(target) {
      this._activeTarget = target;

      this._clear();

      var queries = this._selector.split(',');
      queries = queries.map(function (selector) {
        return selector + '[data-target="' + target + '"],' + (selector + '[href="' + target + '"]');
      });

      var $link = $(queries.join(','));

      if ($link.hasClass(ClassName.DROPDOWN_ITEM)) {
        $link.closest(Selector.DROPDOWN).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
        $link.addClass(ClassName.ACTIVE);
      } else {
        // todo (fat) this is kinda sus...
        // recursively add actives to tested nav-links
        $link.parents(Selector.LI).find('> ' + Selector.NAV_LINKS).addClass(ClassName.ACTIVE);
      }

      $(this._scrollElement).trigger(Event.ACTIVATE, {
        relatedTarget: target
      });
    };

    ScrollSpy.prototype._clear = function _clear() {
      $(this._selector).filter(Selector.ACTIVE).removeClass(ClassName.ACTIVE);
    };

    // static

    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config;

        if (!data) {
          data = new ScrollSpy(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(ScrollSpy, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return ScrollSpy;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, function () {
    var scrollSpys = $.makeArray($(Selector.DATA_SPY));

    for (var i = scrollSpys.length; i--;) {
      var $spy = $(scrollSpys[i]);
      ScrollSpy._jQueryInterface.call($spy, $spy.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = ScrollSpy._jQueryInterface;
  $.fn[NAME].Constructor = ScrollSpy;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return ScrollSpy._jQueryInterface;
  };

  return ScrollSpy;
}(jQuery);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): tab.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Tab = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'tab';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.tab';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 150;

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    A: 'a',
    LI: 'li',
    DROPDOWN: '.dropdown',
    LIST: 'ul:not(.dropdown-menu), ol:not(.dropdown-menu), nav:not(.dropdown-menu)',
    FADE_CHILD: '> .nav-item .fade, > .fade',
    ACTIVE: '.active',
    ACTIVE_CHILD: '> .nav-item > .active, > .active',
    DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"]',
    DROPDOWN_TOGGLE: '.dropdown-toggle',
    DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Tab = function () {
    function Tab(element) {
      _classCallCheck(this, Tab);

      this._element = element;
    }

    // getters

    // public

    Tab.prototype.show = function show() {
      var _this = this;

      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $(this._element).hasClass(ClassName.ACTIVE) || $(this._element).hasClass(ClassName.DISABLED)) {
        return;
      }

      var target = void 0;
      var previous = void 0;
      var listElement = $(this._element).closest(Selector.LIST)[0];
      var selector = Util.getSelectorFromElement(this._element);

      if (listElement) {
        previous = $.makeArray($(listElement).find(Selector.ACTIVE));
        previous = previous[previous.length - 1];
      }

      var hideEvent = $.Event(Event.HIDE, {
        relatedTarget: this._element
      });

      var showEvent = $.Event(Event.SHOW, {
        relatedTarget: previous
      });

      if (previous) {
        $(previous).trigger(hideEvent);
      }

      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        return;
      }

      if (selector) {
        target = $(selector)[0];
      }

      this._activate(this._element, listElement);

      var complete = function complete() {
        var hiddenEvent = $.Event(Event.HIDDEN, {
          relatedTarget: _this._element
        });

        var shownEvent = $.Event(Event.SHOWN, {
          relatedTarget: previous
        });

        $(previous).trigger(hiddenEvent);
        $(_this._element).trigger(shownEvent);
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    };

    Tab.prototype.dispose = function dispose() {
      $.removeClass(this._element, DATA_KEY);
      this._element = null;
    };

    // private

    Tab.prototype._activate = function _activate(element, container, callback) {
      var _this2 = this;

      var active = $(container).find(Selector.ACTIVE_CHILD)[0];
      var isTransitioning = callback && Util.supportsTransitionEnd() && (active && $(active).hasClass(ClassName.FADE) || Boolean($(container).find(Selector.FADE_CHILD)[0]));

      var complete = function complete() {
        return _this2._transitionComplete(element, active, isTransitioning, callback);
      };

      if (active && isTransitioning) {
        $(active).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        complete();
      }

      if (active) {
        $(active).removeClass(ClassName.SHOW);
      }
    };

    Tab.prototype._transitionComplete = function _transitionComplete(element, active, isTransitioning, callback) {
      if (active) {
        $(active).removeClass(ClassName.ACTIVE);

        var dropdownChild = $(active.parentNode).find(Selector.DROPDOWN_ACTIVE_CHILD)[0];

        if (dropdownChild) {
          $(dropdownChild).removeClass(ClassName.ACTIVE);
        }

        active.setAttribute('aria-expanded', false);
      }

      $(element).addClass(ClassName.ACTIVE);
      element.setAttribute('aria-expanded', true);

      if (isTransitioning) {
        Util.reflow(element);
        $(element).addClass(ClassName.SHOW);
      } else {
        $(element).removeClass(ClassName.FADE);
      }

      if (element.parentNode && $(element.parentNode).hasClass(ClassName.DROPDOWN_MENU)) {

        var dropdownElement = $(element).closest(Selector.DROPDOWN)[0];
        if (dropdownElement) {
          $(dropdownElement).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
        }

        element.setAttribute('aria-expanded', true);
      }

      if (callback) {
        callback();
      }
    };

    // static

    Tab._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY);

        if (!data) {
          data = new Tab(this);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Tab, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }]);

    return Tab;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    event.preventDefault();
    Tab._jQueryInterface.call($(this), 'show');
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Tab._jQueryInterface;
  $.fn[NAME].Constructor = Tab;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tab._jQueryInterface;
  };

  return Tab;
}(jQuery);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): tooltip.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Tooltip = function ($) {

  /**
   * Check for Tether dependency
   * Tether - http://tether.io/
   */
  if (typeof Tether === 'undefined') {
    throw new Error('Bootstrap tooltips require Tether (http://tether.io/)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'tooltip';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.tooltip';
  var EVENT_KEY = '.' + DATA_KEY;
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 150;
  var CLASS_PREFIX = 'bs-tether';

  var Default = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: '0 0',
    constraints: [],
    container: false
  };

  var DefaultType = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: 'string',
    constraints: 'array',
    container: '(string|element|boolean)'
  };

  var AttachmentMap = {
    TOP: 'bottom center',
    RIGHT: 'middle left',
    BOTTOM: 'top center',
    LEFT: 'middle right'
  };

  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    INSERTED: 'inserted' + EVENT_KEY,
    CLICK: 'click' + EVENT_KEY,
    FOCUSIN: 'focusin' + EVENT_KEY,
    FOCUSOUT: 'focusout' + EVENT_KEY,
    MOUSEENTER: 'mouseenter' + EVENT_KEY,
    MOUSELEAVE: 'mouseleave' + EVENT_KEY
  };

  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner'
  };

  var TetherClass = {
    element: false,
    enabled: false
  };

  var Trigger = {
    HOVER: 'hover',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Tooltip = function () {
    function Tooltip(element, config) {
      _classCallCheck(this, Tooltip);

      // private
      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._isTransitioning = false;
      this._tether = null;

      // protected
      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    }

    // getters

    // public

    Tooltip.prototype.enable = function enable() {
      this._isEnabled = true;
    };

    Tooltip.prototype.disable = function disable() {
      this._isEnabled = false;
    };

    Tooltip.prototype.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    Tooltip.prototype.toggle = function toggle(event) {
      if (event) {
        var dataKey = this.constructor.DATA_KEY;
        var context = $(event.currentTarget).data(dataKey);

        if (!context) {
          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
          $(event.currentTarget).data(dataKey, context);
        }

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {

        if ($(this.getTipElement()).hasClass(ClassName.SHOW)) {
          this._leave(null, this);
          return;
        }

        this._enter(null, this);
      }
    };

    Tooltip.prototype.dispose = function dispose() {
      clearTimeout(this._timeout);

      this.cleanupTether();

      $.removeData(this.element, this.constructor.DATA_KEY);

      $(this.element).off(this.constructor.EVENT_KEY);
      $(this.element).closest('.modal').off('hide.bs.modal');

      if (this.tip) {
        $(this.tip).remove();
      }

      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;
      this._tether = null;

      this.element = null;
      this.config = null;
      this.tip = null;
    };

    Tooltip.prototype.show = function show() {
      var _this = this;

      if ($(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements');
      }

      var showEvent = $.Event(this.constructor.Event.SHOW);
      if (this.isWithContent() && this._isEnabled) {
        if (this._isTransitioning) {
          throw new Error('Tooltip is transitioning');
        }
        $(this.element).trigger(showEvent);

        var isInTheDom = $.contains(this.element.ownerDocument.documentElement, this.element);

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        }

        var tip = this.getTipElement();
        var tipId = Util.getUID(this.constructor.NAME);

        tip.setAttribute('id', tipId);
        this.element.setAttribute('aria-describedby', tipId);

        this.setContent();

        if (this.config.animation) {
          $(tip).addClass(ClassName.FADE);
        }

        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

        var attachment = this._getAttachment(placement);

        var container = this.config.container === false ? document.body : $(this.config.container);

        $(tip).data(this.constructor.DATA_KEY, this).appendTo(container);

        $(this.element).trigger(this.constructor.Event.INSERTED);

        this._tether = new Tether({
          attachment: attachment,
          element: tip,
          target: this.element,
          classes: TetherClass,
          classPrefix: CLASS_PREFIX,
          offset: this.config.offset,
          constraints: this.config.constraints,
          addTargetClasses: false
        });

        Util.reflow(tip);
        this._tether.position();

        $(tip).addClass(ClassName.SHOW);

        var complete = function complete() {
          var prevHoverState = _this._hoverState;
          _this._hoverState = null;
          _this._isTransitioning = false;

          $(_this.element).trigger(_this.constructor.Event.SHOWN);

          if (prevHoverState === HoverState.OUT) {
            _this._leave(null, _this);
          }
        };

        if (Util.supportsTransitionEnd() && $(this.tip).hasClass(ClassName.FADE)) {
          this._isTransitioning = true;
          $(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(Tooltip._TRANSITION_DURATION);
          return;
        }

        complete();
      }
    };

    Tooltip.prototype.hide = function hide(callback) {
      var _this2 = this;

      var tip = this.getTipElement();
      var hideEvent = $.Event(this.constructor.Event.HIDE);
      if (this._isTransitioning) {
        throw new Error('Tooltip is transitioning');
      }
      var complete = function complete() {
        if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
          tip.parentNode.removeChild(tip);
        }

        _this2.element.removeAttribute('aria-describedby');
        $(_this2.element).trigger(_this2.constructor.Event.HIDDEN);
        _this2._isTransitioning = false;
        _this2.cleanupTether();

        if (callback) {
          callback();
        }
      };

      $(this.element).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $(tip).removeClass(ClassName.SHOW);

      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false;

      if (Util.supportsTransitionEnd() && $(this.tip).hasClass(ClassName.FADE)) {
        this._isTransitioning = true;
        $(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        complete();
      }

      this._hoverState = '';
    };

    // protected

    Tooltip.prototype.isWithContent = function isWithContent() {
      return Boolean(this.getTitle());
    };

    Tooltip.prototype.getTipElement = function getTipElement() {
      return this.tip = this.tip || $(this.config.template)[0];
    };

    Tooltip.prototype.setContent = function setContent() {
      var $tip = $(this.getTipElement());

      this.setElementContent($tip.find(Selector.TOOLTIP_INNER), this.getTitle());

      $tip.removeClass(ClassName.FADE + ' ' + ClassName.SHOW);

      this.cleanupTether();
    };

    Tooltip.prototype.setElementContent = function setElementContent($element, content) {
      var html = this.config.html;
      if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' && (content.nodeType || content.jquery)) {
        // content is a DOM node or a jQuery
        if (html) {
          if (!$(content).parent().is($element)) {
            $element.empty().append(content);
          }
        } else {
          $element.text($(content).text());
        }
      } else {
        $element[html ? 'html' : 'text'](content);
      }
    };

    Tooltip.prototype.getTitle = function getTitle() {
      var title = this.element.getAttribute('data-original-title');

      if (!title) {
        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
      }

      return title;
    };

    Tooltip.prototype.cleanupTether = function cleanupTether() {
      if (this._tether) {
        this._tether.destroy();
      }
    };

    // private

    Tooltip.prototype._getAttachment = function _getAttachment(placement) {
      return AttachmentMap[placement.toUpperCase()];
    };

    Tooltip.prototype._setListeners = function _setListeners() {
      var _this3 = this;

      var triggers = this.config.trigger.split(' ');

      triggers.forEach(function (trigger) {
        if (trigger === 'click') {
          $(_this3.element).on(_this3.constructor.Event.CLICK, _this3.config.selector, function (event) {
            return _this3.toggle(event);
          });
        } else if (trigger !== Trigger.MANUAL) {
          var eventIn = trigger === Trigger.HOVER ? _this3.constructor.Event.MOUSEENTER : _this3.constructor.Event.FOCUSIN;
          var eventOut = trigger === Trigger.HOVER ? _this3.constructor.Event.MOUSELEAVE : _this3.constructor.Event.FOCUSOUT;

          $(_this3.element).on(eventIn, _this3.config.selector, function (event) {
            return _this3._enter(event);
          }).on(eventOut, _this3.config.selector, function (event) {
            return _this3._leave(event);
          });
        }

        $(_this3.element).closest('.modal').on('hide.bs.modal', function () {
          return _this3.hide();
        });
      });

      if (this.config.selector) {
        this.config = $.extend({}, this.config, {
          trigger: 'manual',
          selector: ''
        });
      } else {
        this._fixTitle();
      }
    };

    Tooltip.prototype._fixTitle = function _fixTitle() {
      var titleType = _typeof(this.element.getAttribute('data-original-title'));
      if (this.element.getAttribute('title') || titleType !== 'string') {
        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
        this.element.setAttribute('title', '');
      }
    };

    Tooltip.prototype._enter = function _enter(event, context) {
      var dataKey = this.constructor.DATA_KEY;

      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      }

      if ($(context.getTipElement()).hasClass(ClassName.SHOW) || context._hoverState === HoverState.SHOW) {
        context._hoverState = HoverState.SHOW;
        return;
      }

      clearTimeout(context._timeout);

      context._hoverState = HoverState.SHOW;

      if (!context.config.delay || !context.config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    Tooltip.prototype._leave = function _leave(event, context) {
      var dataKey = this.constructor.DATA_KEY;

      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);

      context._hoverState = HoverState.OUT;

      if (!context.config.delay || !context.config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    Tooltip.prototype._isWithActiveTrigger = function _isWithActiveTrigger() {
      for (var trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    };

    Tooltip.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, this.constructor.Default, $(this.element).data(), config);

      if (config.delay && typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);

      return config;
    };

    Tooltip.prototype._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        for (var key in this.config) {
          if (this.constructor.Default[key] !== this.config[key]) {
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    // static

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Tooltip(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }, {
      key: 'NAME',
      get: function get() {
        return NAME;
      }
    }, {
      key: 'DATA_KEY',
      get: function get() {
        return DATA_KEY;
      }
    }, {
      key: 'Event',
      get: function get() {
        return Event;
      }
    }, {
      key: 'EVENT_KEY',
      get: function get() {
        return EVENT_KEY;
      }
    }, {
      key: 'DefaultType',
      get: function get() {
        return DefaultType;
      }
    }]);

    return Tooltip;
  }();

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Tooltip._jQueryInterface;
  $.fn[NAME].Constructor = Tooltip;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tooltip._jQueryInterface;
  };

  return Tooltip;
}(jQuery); /* global Tether */
;
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): popover.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Popover = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'popover';
  var VERSION = '4.0.0-alpha.6';
  var DATA_KEY = 'bs.popover';
  var EVENT_KEY = '.' + DATA_KEY;
  var JQUERY_NO_CONFLICT = $.fn[NAME];

  var Default = $.extend({}, Tooltip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<h3 class="popover-title"></h3>' + '<div class="popover-content"></div></div>'
  });

  var DefaultType = $.extend({}, Tooltip.DefaultType, {
    content: '(string|element|function)'
  });

  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    TITLE: '.popover-title',
    CONTENT: '.popover-content'
  };

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    INSERTED: 'inserted' + EVENT_KEY,
    CLICK: 'click' + EVENT_KEY,
    FOCUSIN: 'focusin' + EVENT_KEY,
    FOCUSOUT: 'focusout' + EVENT_KEY,
    MOUSEENTER: 'mouseenter' + EVENT_KEY,
    MOUSELEAVE: 'mouseleave' + EVENT_KEY
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  var Popover = function (_Tooltip) {
    _inherits(Popover, _Tooltip);

    function Popover() {
      _classCallCheck(this, Popover);

      return _possibleConstructorReturn(this, _Tooltip.apply(this, arguments));
    }

    // overrides

    Popover.prototype.isWithContent = function isWithContent() {
      return this.getTitle() || this._getContent();
    };

    Popover.prototype.getTipElement = function getTipElement() {
      return this.tip = this.tip || $(this.config.template)[0];
    };

    Popover.prototype.setContent = function setContent() {
      var $tip = $(this.getTipElement());

      // we use append for html objects to maintain js events
      this.setElementContent($tip.find(Selector.TITLE), this.getTitle());
      this.setElementContent($tip.find(Selector.CONTENT), this._getContent());

      $tip.removeClass(ClassName.FADE + ' ' + ClassName.SHOW);

      this.cleanupTether();
    };

    // private

    Popover.prototype._getContent = function _getContent() {
      return this.element.getAttribute('data-content') || (typeof this.config.content === 'function' ? this.config.content.call(this.element) : this.config.content);
    };

    // static

    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' ? config : null;

        if (!data && /destroy|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Popover(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Popover, null, [{
      key: 'VERSION',


      // getters

      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }, {
      key: 'NAME',
      get: function get() {
        return NAME;
      }
    }, {
      key: 'DATA_KEY',
      get: function get() {
        return DATA_KEY;
      }
    }, {
      key: 'Event',
      get: function get() {
        return Event;
      }
    }, {
      key: 'EVENT_KEY',
      get: function get() {
        return EVENT_KEY;
      }
    }, {
      key: 'DefaultType',
      get: function get() {
        return DefaultType;
      }
    }]);

    return Popover;
  }(Tooltip);

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Popover._jQueryInterface;
  $.fn[NAME].Constructor = Popover;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Popover._jQueryInterface;
  };

  return Popover;
}(jQuery);











// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//





;
