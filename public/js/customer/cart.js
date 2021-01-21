/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    if (
      (utils.isBlob(requestData) || utils.isFile(requestData)) &&
      requestData.type
    ) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = unescape(encodeURIComponent(config.auth.password)) || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./resources/scss/scss.scss":
/*!***************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./resources/scss/scss.scss ***!
  \***************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".noty_layout_mixin, #noty_layout__centerRight, #noty_layout__centerLeft, #noty_layout__center, #noty_layout__bottomRight, #noty_layout__bottomCenter, #noty_layout__bottomLeft, #noty_layout__bottom, #noty_layout__topRight, #noty_layout__topCenter, #noty_layout__topLeft, #noty_layout__top {\n  position: fixed;\n  margin: 0;\n  padding: 0;\n  z-index: 9999999;\n  transform: translateZ(0) scale(1, 1);\n  backface-visibility: hidden;\n  -webkit-font-smoothing: subpixel-antialiased;\n  filter: blur(0);\n  -webkit-filter: blur(0);\n  max-width: 90%;\n}\n\n#noty_layout__top {\n  top: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__topLeft {\n  top: 20px;\n  left: 20px;\n  width: 325px;\n}\n\n#noty_layout__topCenter {\n  top: 5%;\n  left: 50%;\n  width: 325px;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__topRight {\n  top: 20px;\n  right: 20px;\n  width: 325px;\n}\n\n#noty_layout__bottom {\n  bottom: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__bottomLeft {\n  bottom: 20px;\n  left: 20px;\n  width: 325px;\n}\n\n#noty_layout__bottomCenter {\n  bottom: 5%;\n  left: 50%;\n  width: 325px;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__bottomRight {\n  bottom: 20px;\n  right: 20px;\n  width: 325px;\n}\n\n#noty_layout__center {\n  top: 50%;\n  left: 50%;\n  width: 325px;\n  transform: translate(calc(-50% - .5px), calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__centerLeft {\n  top: 50%;\n  left: 20px;\n  width: 325px;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n#noty_layout__centerRight {\n  top: 50%;\n  right: 20px;\n  width: 325px;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n.noty_progressbar {\n  display: none;\n}\n\n.noty_has_timeout.noty_has_progressbar .noty_progressbar {\n  display: block;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  height: 3px;\n  width: 100%;\n  background-color: #646464;\n  opacity: 0.2;\n  filter: alpha(opacity=10);\n}\n\n.noty_bar {\n  -webkit-backface-visibility: hidden;\n  -webkit-transform: translate(0, 0) translateZ(0) scale(1, 1);\n  transform: translate(0, 0) scale(1, 1);\n  -webkit-font-smoothing: subpixel-antialiased;\n  overflow: hidden;\n}\n\n.noty_effects_open {\n  opacity: 0;\n  transform: translate(50%);\n  animation: noty_anim_in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_effects_close {\n  animation: noty_anim_out 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_fix_effects_height {\n  animation: noty_anim_height 75ms ease-out;\n}\n\n.noty_close_with_click {\n  cursor: pointer;\n}\n\n.noty_close_button {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  font-weight: bold;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  line-height: 20px;\n  background-color: rgba(0, 0, 0, 0.05);\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all 0.2s ease-out;\n}\n\n.noty_close_button:hover {\n  background-color: rgba(0, 0, 0, 0.1);\n}\n\n.noty_modal {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  background-color: #000;\n  z-index: 10000;\n  opacity: 0.3;\n  left: 0;\n  top: 0;\n}\n\n.noty_modal.noty_modal_open {\n  opacity: 0;\n  animation: noty_modal_in 0.3s ease-out;\n}\n\n.noty_modal.noty_modal_close {\n  animation: noty_modal_out 0.3s ease-out;\n  animation-fill-mode: forwards;\n}\n\n@keyframes noty_modal_in {\n  100% {\n    opacity: 0.3;\n  }\n}\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes noty_anim_in {\n  100% {\n    transform: translate(0);\n    opacity: 1;\n  }\n}\n@keyframes noty_anim_out {\n  100% {\n    transform: translate(50%);\n    opacity: 0;\n  }\n}\n@keyframes noty_anim_height {\n  100% {\n    height: 0;\n  }\n}\n.noty_theme__mint.noty_bar {\n  margin: 4px 0;\n  overflow: hidden;\n  border-radius: 2px;\n  position: relative;\n}\n.noty_theme__mint.noty_bar .noty_body {\n  padding: 10px;\n  font-size: 14px;\n}\n.noty_theme__mint.noty_bar .noty_buttons {\n  padding: 10px;\n}\n\n.noty_theme__mint.noty_type__alert,\n.noty_theme__mint.noty_type__notification {\n  background-color: #fff;\n  border-bottom: 1px solid #D1D1D1;\n  color: #2F2F2F;\n}\n\n.noty_theme__mint.noty_type__warning {\n  background-color: #FFAE42;\n  border-bottom: 1px solid #E89F3C;\n  color: #fff;\n}\n\n.noty_theme__mint.noty_type__error {\n  background-color: #DE636F;\n  border-bottom: 1px solid #CA5A65;\n  color: #fff;\n}\n\n.noty_theme__mint.noty_type__info,\n.noty_theme__mint.noty_type__information {\n  background-color: #7F7EFF;\n  border-bottom: 1px solid #7473E8;\n  color: #fff;\n}\n\n.noty_theme__mint.noty_type__success {\n  background-color: #AFC765;\n  border-bottom: 1px solid #A0B55C;\n  color: #fff;\n}\n\n* {\n  margin: 0;\n}\n\nhtml,\nbody {\n  height: 100%;\n  width: 100%;\n}\n\nbutton:focus {\n  outline: none;\n}\n\nbody {\n  font-family: \"Lato\", \"sans-serif\";\n  -webkit-font-smoothing: antialiased;\n  color: #232323;\n  width: 100%;\n}\n\nnav {\n  position: relative;\n  min-height: 120px;\n}\n\n.nav-wrapper {\n  display: inline-block;\n  padding: 10px;\n  position: absolute;\n  top: 20%;\n  right: 1%;\n}\n\n.nav-wrapper ul li {\n  display: inline-block;\n  margin: 0 10px;\n  padding: 5px;\n  font-size: 18px;\n}\n\n.nav-wrapper ul li:last-child {\n  position: relative;\n}\n\n.total-counter {\n  position: absolute;\n  background: #64a0ff;\n  color: white;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  padding: 2px 0px 0 6px;\n  font-size: 13px;\n  font-weight: bold;\n  top: -10%;\n  right: -20%;\n}\n\n.nav-wrapper ul li a {\n  color: #FE5F1E;\n  text-decoration: none;\n}\n\n.cart {\n  width: 44px;\n  height: 30px;\n}\n\n.logo-wrapper {\n  position: absolute;\n  top: 5%;\n  left: 0%;\n  display: inline-block;\n}\n\n.logo-wrapper img {\n  width: 150px;\n  height: 120px;\n}\n\n.logo-wrapper span {\n  position: absolute;\n  top: 40%;\n  left: 100%;\n  letter-spacing: 6px;\n  color: #FE5F1E;\n  font-size: 23px;\n  font-weight: 600;\n}\n\n.intro-container {\n  position: relative;\n  height: 80%;\n  width: 100%;\n  background: #f8f8f8;\n  left: 0;\n}\n\n.banner {\n  position: absolute;\n  right: 0%;\n  top: 14%;\n  width: 34%;\n  height: 79%;\n}\n\n.caption {\n  font-size: 20px;\n  letter-spacing: 2px;\n  padding: 10px;\n  position: absolute;\n  top: 40%;\n  left: 5%;\n}\n\n.caption h1 {\n  color: #232323;\n  font-size: 50px;\n  letter-spacing: 6px;\n  margin: 20px 0;\n}\n\n.order {\n  background: #FE5F1E;\n  color: #fff;\n  padding: 7px;\n  border: 1px white solid;\n  border-radius: 6px;\n  text-decoration: none;\n  width: 60%;\n  display: block;\n  text-align: center;\n}\n\n.order:hover {\n  background-color: #232323;\n  color: #fff;\n}\n\n.nav-wrapper ul li a:hover {\n  color: #232323;\n}\n\n.menu-container {\n  height: 100%;\n  position: relative;\n  width: 100%;\n}\n\n.menu-container h2 {\n  font-size: 30px;\n  margin: 30px;\n  font-weight: bold;\n  color: #FE5F1E;\n  letter-spacing: 5px;\n}\n\n.menu-item img {\n  width: 50%;\n  height: 50%;\n  display: block;\n  margin: auto;\n}\n\n.menu-item .item-name {\n  display: block;\n  text-align: center;\n  font-weight: 700;\n  letter-spacing: 2px;\n  font-size: 18px;\n  color: #232323;\n  margin: 5px 0;\n}\n\n.menu-item .item-price {\n  display: inline-block;\n  width: 40%;\n  text-align: left;\n  padding: 5px;\n  padding-left: 20px;\n  font-weight: 500;\n  color: #232323;\n}\n\n.menu-item button {\n  background: #FE5F1E;\n  color: #fff;\n  word-spacing: 10px;\n  padding: 5px;\n  border: 1px white solid;\n  border-radius: 5px;\n  margin-left: 30px;\n}\n\n.menu-item button:focus {\n  outline: none;\n}\n\n.cart-empty h1, .cart-nonempty h1 {\n  color: #232323;\n  text-align: center;\n  font-weight: 700;\n  font-size: 30px;\n  margin: 20px 0;\n  letter-spacing: 3px;\n}\n\n.cart-empty p {\n  font-size: 20px;\n  margin: auto;\n  text-align: center;\n  padding: 5px;\n}\n\n.img-wrapper {\n  width: 40%;\n  margin: auto;\n}\n\n.img-wrapper img {\n  width: 100%;\n  height: 100%;\n}\n\n.cart-empty a {\n  background: #FE5F1E;\n  color: #fff;\n  padding: 7px;\n  border: 1px white solid;\n  border-radius: 6px;\n  text-decoration: none;\n  width: 100px;\n  margin: 10px auto;\n  display: block;\n  text-align: center;\n}\n\n.cart-empty a:hover {\n  background-color: #232323;\n  color: #fff;\n}\n\n.cart-nonempty {\n  background: #f8f8f8;\n  min-height: 100%;\n}\n\n.counter-container {\n  width: 70%;\n  margin: auto;\n}\n\n.cart-nonempty h1 {\n  font-size: 20px;\n  padding: 20px;\n  text-align: left;\n  letter-spacing: 2px;\n}\n\n.counter {\n  padding-bottom: 15px;\n  border-bottom: 1px #ccc solid;\n}\n\n.pizza-display img {\n  width: 30%;\n  display: block;\n  margin: auto;\n}\n\n.pizza-name {\n  display: block;\n  width: 100%;\n  text-align: center;\n  font-size: 18px;\n  color: #FE5F1E;\n}\n\n.pizza-size {\n  display: block;\n  width: 100%;\n  text-align: center;\n  font-size: 16px;\n  color: #ccc;\n}\n\n.pizza-price, .pizza-number {\n  display: block;\n  width: 100%;\n  align-self: center;\n  text-align: center;\n  font-size: 18px;\n  color: #232323;\n}\n\n.total {\n  padding: 20px;\n  text-align: right;\n}\n\n.total span {\n  color: #FE5F1E;\n  padding: 0 5px;\n}\n\n.address {\n  margin: 10px 0;\n  text-align: right;\n  position: relative;\n}\n\n.address input {\n  width: 40%;\n  height: 20px;\n  position: absolute;\n  padding: 10px;\n  right: 0;\n  border: 1px #ccc solid;\n  border-radius: 1px;\n}\n\n.address button {\n  background: #FE5F1E;\n  color: #fff;\n  border-radius: 10px;\n  padding: 7px;\n  font-size: 15px;\n  border: 1px #ccc solid;\n  position: absolute;\n  top: 40px;\n  right: 0;\n}\n\n.login-container, .register-container {\n  background: #f8f8f8;\n}\n\n.login-container input, .register-container input {\n  margin: 20px auto;\n}\n\n.login-button {\n  background: #FE5F1E;\n  color: #fff;\n  font-size: 16px;\n  padding: 10px;\n  border-radius: 10px;\n  border: 1px #ccc solid;\n}\n\n.login-button:hover {\n  background: black;\n}\n\n.forgot-pw {\n  color: #FE5F1E;\n  font-weight: 700;\n}\n\n.forgot-pw:hover {\n  color: #232323;\n}\n\n.auth-error {\n  color: red;\n  font-size: 14px;\n  padding: 10px;\n  text-align: center;\n}\n\n.logged-in-name {\n  font-size: 16px;\n  font-weight: 501;\n  position: absolute;\n  top: 10%;\n  right: 9%;\n  color: orange;\n}\n\n.not-logged-in-msg {\n  color: red;\n  font-weight: 600;\n  font-size: 16px;\n  padding: 10px;\n  text-align: center;\n}\n\n.not-logged-in-msg a {\n  color: blue;\n  text-decoration: underline;\n  display: inline-block;\n  padding: 0 5px;\n}\n\n.order-thead {\n  padding: 5px;\n  border: 1px solid gray;\n}\n\n.order-thead div {\n  border-left: 1px solid gray;\n  text-align: center;\n}\n\n.order-row {\n  padding: 5px;\n  transition: all 3s ease;\n}\n\n.order-row div {\n  text-align: center;\n  padding: 3px;\n  border-left: 1px solid gray;\n  border-bottom: 1px solid gray;\n}\n\n@keyframes shake {\n  33% {\n    transform: rotate(50deg);\n  }\n  66% {\n    transform: rotate(-50deg);\n  }\n}\n.track-container {\n  background: #f8f8f8;\n  width: 100%;\n  height: 600px;\n}\n\n.tracking-section {\n  width: 70%;\n  margin: 20px auto;\n  padding-top: 100px;\n  height: 500px;\n}\n\n.order-info {\n  position: relative;\n}\n\n.order-info h1 {\n  font-weight: 600;\n  position: absolute;\n}\n\n.order-info .order-id {\n  position: absolute;\n  right: 0;\n  color: orange;\n}\n\n.order-status {\n  margin: 50px;\n  position: relative;\n  left: 18%;\n  top: 3%;\n}\n\n.order-status li {\n  margin: 50px;\n  width: 300px;\n  font-size: 16px;\n  position: relative;\n  letter-spacing: 1.5px;\n}\n\n.order-status li .icon {\n  font-size: 30px;\n  position: absolute;\n  right: 0;\n  top: -5px;\n  transition: transform 2s ease;\n  transform: scale(1.2);\n}\n\n.orders-small {\n  display: none;\n}\n\n.order-status li:before {\n  content: \"\";\n  background: black;\n  border-radius: 50%;\n  width: 10px;\n  height: 10px;\n  right: 88px;\n  top: 7px;\n  position: absolute;\n}\n\n.order-status li:after {\n  content: \"\";\n  background: black;\n  width: 2px;\n  height: 188%;\n  margin-top: 15px;\n  right: 92px;\n  top: 10px;\n  position: absolute;\n}\n\n@media screen and (max-width: 650px) {\n  .menu-item .item-price {\n    text-align: center;\n  }\n\n  .banner {\n    right: 1%;\n    top: 41%;\n    width: 43%;\n    height: 180px;\n  }\n\n  .order-status {\n    margin: 0;\n    left: 0;\n    width: 100%;\n    top: 5%;\n  }\n\n  .order-info {\n    padding: 10px;\n  }\n\n  .order-info h1 {\n    position: static;\n    font-size: 14px;\n  }\n\n  .order-info .order-id {\n    position: static;\n    font-size: 13px;\n  }\n\n  .tracking-section {\n    padding-top: 36px;\n  }\n\n  .order-status li {\n    font-size: 13px;\n    margin: 30px;\n  }\n\n  .tracking-container {\n    height: 450px;\n  }\n\n  .tracking-section {\n    width: 100%;\n  }\n\n  .orders-small {\n    display: block;\n  }\n\n  .success-alert {\n    font-size: 14px;\n  }\n\n  .orders {\n    display: none;\n  }\n\n  .auth-error {\n    font-size: 13px;\n  }\n\n  .caption {\n    font-size: 14px;\n    top: 17%;\n    left: 4%;\n  }\n\n  .order {\n    width: 50%;\n  }\n\n  .caption h1 {\n    font-size: 35px;\n  }\n\n  .intro-container {\n    height: 50%;\n  }\n\n  .menu-container h2 {\n    font-size: 20px;\n  }\n\n  .menu-item img {\n    height: 90px;\n  }\n\n  .menu-item .item-name {\n    font-size: 14px;\n  }\n\n  .logo-wrapper img {\n    margin: 5px;\n    display: inline;\n    height: 100px;\n  }\n\n  .logo-wrapper {\n    position: static;\n    text-align: center;\n    display: block;\n  }\n\n  .logo-wrapper span {\n    position: static;\n  }\n\n  .nav-wrapper {\n    display: block;\n    text-align: center;\n    position: static;\n  }\n\n  .cart-nonempty h1 {\n    font-size: 16px;\n  }\n\n  .not-logged-in-msg {\n    font-size: 14px;\n    padding: 0;\n  }\n\n  .total {\n    font-size: 14px;\n  }\n\n  .pizza-name, .pizza-size, .pizza-number, .pizza-price {\n    font-size: 14px;\n  }\n\n  .cart-nonempty {\n    min-height: 0;\n  }\n\n  .sign-in-msg {\n    font-size: 16px;\n  }\n\n  .login-container input, .register-container input {\n    padding: 5px;\n    font-size: 13px;\n    margin: 20px auto;\n  }\n\n  .login-button {\n    font-size: 14px;\n  }\n\n  .address input {\n    width: 80%;\n  }\n\n  .address button {\n    font-size: 13px;\n  }\n\n  .logged-in-name {\n    font-size: 13px;\n    top: 5%;\n  }\n\n  .cart-empty p {\n    font-size: 14px;\n  }\n\n  .cart-empty h1 {\n    font-size: 20px;\n  }\n\n  .cart-empty a {\n    font-size: 13px;\n  }\n\n  .forgot-pw {\n    font-size: 15px;\n  }\n\n  .total-counter {\n    padding: 2px;\n  }\n\n  .nav-wrapper ul li {\n    padding: 1px;\n  }\n}", "",{"version":3,"sources":["webpack://./node_modules/noty/src/noty.scss","webpack://./resources/scss/scss.scss","webpack://./node_modules/noty/src/themes/mint.scss","webpack://./resources/scss/_variables.scss"],"names":[],"mappings":"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","sourcesContent":["$noty-primary-color: #333;\n$noty-default-width: 325px;\n$noty-corner-space: 20px;\n\n.noty_layout_mixin {\n  position: fixed;\n  margin: 0;\n  padding: 0;\n  z-index: 9999999;\n  transform: translateZ(0) scale(1.0, 1.0);\n  backface-visibility: hidden;\n  -webkit-font-smoothing: subpixel-antialiased;\n  filter: blur(0);\n  -webkit-filter: blur(0);\n  max-width: 90%;\n}\n\n#noty_layout__top {\n  @extend .noty_layout_mixin;\n  top: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__topLeft {\n  @extend .noty_layout_mixin;\n  top: $noty-corner-space;\n  left: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__topCenter {\n  @extend .noty_layout_mixin;\n  top: 5%;\n  left: 50%;\n  width: $noty-default-width;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__topRight {\n  @extend .noty_layout_mixin;\n  top: $noty-corner-space;\n  right: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__bottom {\n  @extend .noty_layout_mixin;\n  bottom: 0;\n  left: 5%;\n  width: 90%;\n}\n\n#noty_layout__bottomLeft {\n  @extend .noty_layout_mixin;\n  bottom: $noty-corner-space;\n  left: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__bottomCenter {\n  @extend .noty_layout_mixin;\n  bottom: 5%;\n  left: 50%;\n  width: $noty-default-width;\n  transform: translate(calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__bottomRight {\n  @extend .noty_layout_mixin;\n  bottom: $noty-corner-space;\n  right: $noty-corner-space;\n  width: $noty-default-width;\n}\n\n#noty_layout__center {\n  @extend .noty_layout_mixin;\n  top: 50%;\n  left: 50%;\n  width: $noty-default-width;\n  transform: translate(calc(-50% - .5px), calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__centerLeft {\n  @extend .noty_layout_mixin;\n  top: 50%;\n  left: $noty-corner-space;\n  width: $noty-default-width;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1.0, 1.0);\n}\n\n#noty_layout__centerRight {\n  @extend .noty_layout_mixin;\n  top: 50%;\n  right: $noty-corner-space;\n  width: $noty-default-width;\n  transform: translate(0, calc(-50% - .5px)) translateZ(0) scale(1, 1);\n}\n\n.noty_progressbar {\n  display: none;\n}\n\n.noty_has_timeout.noty_has_progressbar .noty_progressbar {\n  display: block;\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  height: 3px;\n  width: 100%;\n  background-color: #646464;\n  opacity: 0.2;\n  filter: alpha(opacity=10)\n}\n\n.noty_bar {\n  -webkit-backface-visibility: hidden;\n  -webkit-transform: translate(0, 0) translateZ(0) scale(1.0, 1.0);\n  transform: translate(0, 0) scale(1.0, 1.0);\n  -webkit-font-smoothing: subpixel-antialiased;\n  overflow: hidden;\n}\n\n.noty_effects_open {\n  opacity: 0;\n  transform: translate(50%);\n  animation: noty_anim_in .5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_effects_close {\n  animation: noty_anim_out .5s cubic-bezier(0.68, -0.55, 0.265, 1.55);\n  animation-fill-mode: forwards;\n}\n\n.noty_fix_effects_height {\n  animation: noty_anim_height 75ms ease-out;\n}\n\n.noty_close_with_click {\n  cursor: pointer;\n}\n\n.noty_close_button {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  font-weight: bold;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  line-height: 20px;\n  background-color: rgba(0, 0, 0, .05);\n  border-radius: 2px;\n  cursor: pointer;\n  transition: all .2s ease-out;\n}\n\n.noty_close_button:hover {\n  background-color: rgba(0, 0, 0, .1);\n}\n\n.noty_modal {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  background-color: #000;\n  z-index: 10000;\n  opacity: .3;\n  left: 0;\n  top: 0;\n}\n\n.noty_modal.noty_modal_open {\n  opacity: 0;\n  animation: noty_modal_in .3s ease-out;\n}\n.noty_modal.noty_modal_close {\n  animation: noty_modal_out .3s ease-out;\n  animation-fill-mode: forwards;\n}\n\n@keyframes noty_modal_in {\n  100% {\n    opacity: .3;\n  }\n}\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n\n@keyframes noty_modal_out {\n  100% {\n    opacity: 0;\n  }\n}\n\n@keyframes noty_anim_in {\n  100% {\n    transform: translate(0);\n    opacity: 1;\n  }\n}\n\n@keyframes noty_anim_out {\n  100% {\n    transform: translate(50%);\n    opacity: 0;\n  }\n}\n\n@keyframes noty_anim_height {\n  100% {\n    height: 0;\n  }\n}\n\n//@import \"themes/relax\";\n//@import \"themes/metroui\";\n//@import \"themes/mint\";\n//@import \"themes/sunset\";\n//@import \"themes/bootstrap-v3\";\n//@import \"themes/bootstrap-v4\";\n//@import \"themes/semanticui\";\n//@import \"themes/nest\";\n//@import \"themes/light\";\n","@import './variables';\r\n@import '~noty/src/noty.scss';\r\n@import '~noty/src/themes/mint.scss';\r\n* {\r\n  margin: 0;\r\n}\r\n\r\nhtml,\r\nbody {\r\n  height: 100%;\r\n  width: 100%;\r\n}\r\n\r\nbutton:focus{\r\n  outline:none;\r\n}\r\n\r\nbody {\r\n  font-family: \"Lato\", \"sans-serif\";\r\n  -webkit-font-smoothing: antialiased;\r\n  color: #232323;\r\n  width : 100%;\r\n}\r\n\r\nnav {\r\n  position: relative;\r\n  min-height: 120px;\r\n}\r\n\r\n.nav-wrapper {\r\n  display: inline-block;\r\n  padding: 10px;\r\n  position: absolute;\r\n  top: 20%;\r\n  right: 1%;\r\n}\r\n\r\n.nav-wrapper ul li {\r\n  display: inline-block;\r\n  margin: 0 10px;\r\n  padding: 5px;\r\n  font-size: 18px;\r\n}\r\n\r\n.nav-wrapper ul li:last-child{\r\nposition:relative;\r\n}\r\n\r\n.total-counter {\r\n    position: absolute;\r\n    background: rgba(100,160,255,1);\r\n    color: white;\r\n    width: 20px;\r\n    height: 20px;\r\n    border-radius: 50%;\r\n    padding: 2px 0px 0 6px;\r\n    font-size: 13px;\r\n    font-weight: bold;\r\n    top: -10%;\r\n    right: -20%;\r\n}\r\n\r\n.nav-wrapper ul li a {\r\n  color: #FE5F1E;\r\n  text-decoration: none;\r\n}\r\n\r\n.cart {\r\n  width: 44px;\r\n  height: 30px;\r\n}\r\n\r\n.logo-wrapper {\r\n  position: absolute;\r\n  top: 5%;\r\n  left: 0%;\r\n  display: inline-block;\r\n}\r\n\r\n.logo-wrapper img {\r\n  width: 150px;\r\n  height: 120px;\r\n}\r\n\r\n.logo-wrapper span {\r\n  position: absolute;\r\n  top: 40%;\r\n  left: 100%;\r\n  letter-spacing: 6px;\r\n  color: #FE5F1E;\r\n  font-size: 23px;\r\n  font-weight: 600;\r\n}\r\n\r\n.intro-container {\r\n  position: relative;\r\n  height: 80%;\r\n  width: 100%;\r\n  background: #f8f8f8;\r\n  left: 0;\r\n}\r\n\r\n.banner {\r\n  position: absolute;\r\n  right: 0%;\r\n  top: 14%;\r\n  width: 34%;\r\n  height: 79%;\r\n}\r\n\r\n.caption {\r\n  font-size: 20px;\r\n  letter-spacing: 2px;\r\n  padding: 10px;\r\n  position: absolute;\r\n  top: 40%;\r\n  left: 5%;\r\n}\r\n\r\n.caption h1 {\r\n  color: #232323;\r\n  font-size: 50px;\r\n  letter-spacing: 6px;\r\n  margin: 20px 0;\r\n}\r\n\r\n.order {\r\n  background: #FE5F1E;\r\n  color: #fff;\r\n  padding: 7px;\r\n  border: 1px white solid;\r\n  border-radius: 6px;\r\n  text-decoration: none;\r\n  width: 60%;\r\n  display: block;\r\n  text-align: center;\r\n}\r\n\r\n.order:hover {\r\nbackground-color:$dark;\r\ncolor:$pure;\r\n\r\n}\r\n\r\n.nav-wrapper ul li a:hover {\r\n  color: #232323;\r\n}\r\n\r\n.menu-container {\r\n  height: 100%;\r\n  position: relative;\r\n  width: 100%;\r\n}\r\n\r\n.menu-container h2 {\r\n  font-size: 30px;\r\n  margin: 30px;\r\n  font-weight:bold;\r\n  color:$primary;\r\n  letter-spacing: 5px;\r\n}\r\n\r\n.menu-item img {\r\n  width: 50%;\r\n  height: 50%;\r\n  display: block;\r\n  margin: auto;\r\n}\r\n\r\n.menu-item .item-name {\r\n  display: block;\r\n  text-align: center;\r\n  font-weight:700;\r\n  letter-spacing: 2px;\r\n  font-size: 18px;\r\n  color: #232323;\r\n  margin: 5px 0;\r\n}\r\n\r\n.menu-item .item-price {\r\n  display: inline-block;\r\n  width: 40%;\r\n  text-align: left;\r\n  padding: 5px;\r\n  padding-left: 20px;\r\n  font-weight: 500;\r\n  color: #232323;\r\n}\r\n\r\n.menu-item button {\r\n  background: #FE5F1E;\r\n  color: #fff;\r\n  word-spacing: 10px;\r\n  padding: 5px;\r\n  border: 1px white solid;\r\n  border-radius: 5px;\r\n  margin-left: 30px;\r\n}\r\n\r\n\r\n.menu-item button:focus{\r\n  outline : none;\r\n}\r\n\r\n.cart-empty h1, .cart-nonempty h1{\r\n  color:$dark;\r\n  text-align:center;\r\n  font-weight:700;\r\n  font-size:30px;\r\n  margin:20px 0;\r\n  letter-spacing: 3px;\r\n}\r\n\r\n.cart-empty p{\r\n  font-size:20px;\r\n  margin:auto;\r\n  text-align:center;\r\n  padding:5px;\r\n}\r\n\r\n.img-wrapper{\r\n  width:40%;\r\n  margin:auto;\r\n}\r\n\r\n.img-wrapper img{\r\n  width:100%;\r\n  height:100%;\r\n}\r\n\r\n.cart-empty a{\r\n  background: #FE5F1E;\r\n  color: #fff;\r\n  padding: 7px;\r\n  border: 1px white solid;\r\n  border-radius: 6px;\r\n  text-decoration: none;\r\n  width: 100px;\r\n  margin:10px auto;\r\n  display: block;\r\n  text-align: center;\r\n}\r\n\r\n.cart-empty a:hover {\r\nbackground-color:$dark;\r\ncolor:$pure;\r\n}\r\n\r\n.cart-nonempty{\r\n  background:$secondary;\r\n  min-height:100%;\r\n}\r\n\r\n.counter-container{\r\n  width:70%;\r\n  margin:auto;\r\n}\r\n\r\n.cart-nonempty h1{\r\n  font-size:20px;\r\n  padding:20px;\r\n  text-align:left;\r\n  letter-spacing:2px;\r\n}\r\n\r\n.counter{\r\npadding-bottom:15px;\r\nborder-bottom:1px $gray solid;\r\n}\r\n\r\n\r\n.pizza-display img{\r\nwidth:30%;\r\ndisplay:block;\r\nmargin:auto;\r\n}\r\n\r\n.pizza-name{\r\n  display:block;\r\n  width:100%;\r\n  text-align:center;\r\n  font-size:18px;\r\n  color:$primary;\r\n}\r\n\r\n.pizza-size{\r\n  display:block;\r\n  width:100%;\r\n  text-align:center;\r\n  font-size:16px;\r\n  color:$gray;\r\n}\r\n\r\n.pizza-price, .pizza-number{\r\n  display:block;\r\n  width:100%;\r\n  align-self:center;\r\n  text-align:center;\r\n  font-size:18px;\r\n  color:$dark;\r\n}\r\n\r\n.total{\r\n  padding:20px;\r\n   text-align:right;\r\n}\r\n\r\n.total span{\r\n color:$primary;\r\n padding:0 5px;\r\n}\r\n\r\n.address{\r\n  margin:10px 0;\r\n  text-align:right;\r\n  position:relative;\r\n}\r\n\r\n.address input{\r\n  width:40%;\r\n  height:20px;\r\n  position:absolute;\r\n  padding:10px;\r\n  right:0;\r\n  border:1px $gray solid;\r\n  border-radius:1px;\r\n}\r\n\r\n.address button{\r\n  background:$primary;\r\n  color:$pure;\r\n  border-radius:10px;\r\n  padding:7px;\r\n  font-size:15px;\r\n  border:1px $gray solid;\r\n  position:absolute;\r\n  top:40px;\r\n  right:0;\r\n}\r\n\r\n//login and registration\r\n\r\n.login-container, .register-container{\r\n  background:$secondary;\r\n}\r\n\r\n.login-container input, .register-container input{\r\n  margin:20px auto;\r\n}\r\n\r\n.login-button{\r\n  background:$primary;\r\n  color:$pure;\r\n  font-size:16px;\r\n  padding:10px;\r\n  border-radius:10px;\r\n  border:1px $gray solid;\r\n}\r\n\r\n.login-button:hover{\r\n  background : black;\r\n}\r\n.forgot-pw{\r\n  color:$primary;\r\n  font-weight:700;\r\n}\r\n\r\n.forgot-pw:hover{\r\n  color:$dark;\r\n}\r\n\r\n.auth-error{\r\n  color:red;\r\n  font-size:14px;\r\n  padding:10px;\r\n  text-align:center;\r\n}\r\n\r\n.logged-in-name{\r\n  font-size: 16px;\r\nfont-weight: 501;\r\nposition: absolute;\r\ntop: 10%;\r\nright: 9%;\r\ncolor: orange;\r\n}\r\n\r\n.not-logged-in-msg{\r\n  color : red;\r\n  font-weight : 600;\r\n  font-size:16px;\r\n  padding:10px;\r\n  text-align:center;\r\n}\r\n\r\n.not-logged-in-msg a{\r\n  color: blue;\r\n  text-decoration: underline;\r\n  display : inline-block;\r\n  padding: 0 5px;\r\n}\r\n\r\n.order-thead{\r\n  padding : 5px;\r\n  border : 1px solid gray;\r\n}\r\n\r\n.order-thead div{\r\n  border-left : 1px solid gray;\r\n  text-align : center;\r\n}\r\n\r\n.order-row{\r\n  padding : 5px;\r\n  transition: all 3s ease;\r\n}\r\n\r\n.order-row div{\r\n  text-align : center;\r\n  padding : 3px;\r\n  border-left : 1px solid gray;\r\n  border-bottom: 1px solid gray;\r\n}\r\n\r\n@keyframes shake{\r\n  33%{\r\n    transform : rotate(50deg)\r\n  }\r\n\r\n  66%{\r\n    transform: rotate(-50deg)\r\n  }\r\n}\r\n\r\n.track-container{\r\n  background : #f8f8f8;\r\n  width : 100%;\r\n  height : 600px;\r\n}\r\n\r\n.tracking-section{\r\n  width : 70%;\r\n  margin : 20px auto;\r\n  padding-top : 100px;\r\n  height : 500px;\r\n}\r\n\r\n.order-info{\r\n  position: relative;\r\n}\r\n\r\n.order-info h1{\r\n  font-weight: 600;\r\nposition: absolute;\r\n}\r\n\r\n.order-info .order-id{\r\n  position: absolute;\r\n    right: 0;\r\n    color: orange;\r\n}\r\n\r\n.order-status {\r\n  margin : 50px;\r\n  position: relative;\r\n  left: 18%;\r\n  top : 3%;\r\n}\r\n\r\n.order-status li{\r\n  margin: 50px;\r\n  width : 300px;\r\n    font-size: 16px;\r\n    position: relative;\r\n    letter-spacing: 1.5px;\r\n}\r\n\r\n.order-status li .icon{\r\n  font-size: 30px;\r\n  position: absolute;\r\n  right: 0;\r\n  top : -5px;\r\n  transition : transform 2s ease;\r\n  transform : scale(1.2);\r\n}\r\n\r\n.orders-small{\r\n  display : none;\r\n}\r\n\r\n.order-status li:before{\r\n  content : '';\r\n  background : black;\r\n  border-radius : 50%;\r\n  width : 10px;\r\n  height : 10px;\r\n  right : 88px;\r\n  top : 7px;\r\n  position: absolute;\r\n}\r\n\r\n.order-status li:after{\r\n  content: \"\";\r\n    background: black;\r\n    width: 2px;\r\n    height: 188%;\r\n    margin-top: 15px;\r\n    right: 92px;\r\n    top: 10px;\r\n    position: absolute;\r\n}\r\n\r\n\r\n@media screen and (max-width : 650px) {\r\n  .menu-item .item-price{\r\n    text-align: center;\r\n  }\r\n  .banner {\r\n    right: 1%;\r\n   top: 41%;\r\n   width: 43%;\r\n   height: 180px;\r\n }\r\n\r\n .order-status{\r\n   margin : 0;\r\n   left : 0;\r\n   width : 100%;\r\n   top : 5%;\r\n }\r\n\r\n .order-info{\r\n   padding : 10px;\r\n }\r\n\r\n .order-info h1{\r\n   position: static;\r\n   font-size : 14px;\r\n }\r\n\r\n .order-info .order-id{\r\n   position: static;\r\n   font-size : 13px;\r\n }\r\n\r\n .tracking-section{\r\n   padding-top : 36px;\r\n }\r\n\r\n .order-status li {\r\n   font-size: 13px;\r\n   margin : 30px;\r\n }\r\n\r\n .tracking-container{\r\n   height : 450px;\r\n }\r\n\r\n .tracking-section{\r\n   width : 100%;\r\n }\r\n\r\n .orders-small{\r\n   display: block;\r\n }\r\n .success-alert{\r\n   font-size: 14px;\r\n }\r\n .orders{\r\n   display : none;\r\n }\r\n .auth-error{\r\n   font-size: 13px;\r\n }\r\n  .caption{\r\n    font-size: 14px;\r\n    top: 17%;\r\n    left: 4%;\r\n}\r\n.order{\r\n  width : 50%;\r\n}\r\n.caption h1{\r\n  font-size : 35px;\r\n}\r\n.intro-container{\r\n  height : 50%;\r\n}\r\n.menu-container h2{\r\n  font-size : 20px;\r\n}\r\n.menu-item img{\r\n  height : 90px;\r\n}\r\n.menu-item .item-name{\r\n  font-size : 14px;\r\n}\r\n.logo-wrapper img{\r\n  margin: 5px;\r\n    display: inline;\r\n    height: 100px;\r\n}\r\n.logo-wrapper{\r\n  position : static;\r\n  text-align : center;\r\n  display : block;\r\n}\r\n.logo-wrapper span{\r\n  position: static;\r\n}\r\n.nav-wrapper{\r\n  display: block;\r\n  text-align: center;\r\n  position: static;\r\n}\r\n.cart-nonempty h1{\r\n  font-size: 16px;\r\n}\r\n.not-logged-in-msg{\r\n  font-size: 14px;\r\n  padding: 0;\r\n}\r\n.total{\r\n  font-size: 14px;\r\n}\r\n\r\n.pizza-name, .pizza-size, .pizza-number, .pizza-price{\r\n  font-size: 14px;\r\n}\r\n.cart-nonempty{\r\n  min-height : 0;\r\n}\r\n.sign-in-msg{\r\n  font-size : 16px;\r\n}\r\n\r\n.login-container input, .register-container input{\r\n  padding: 5px;\r\n    font-size: 13px;\r\n    margin: 20px auto;\r\n}\r\n.login-button{\r\n  font-size : 14px;\r\n}\r\n.address input{\r\n  width : 80%;\r\n}\r\n.address button{\r\n  font-size: 13px;\r\n}\r\n.logged-in-name{\r\n  font-size: 13px;\r\n  top: 5%;\r\n}\r\n.cart-empty p{\r\n  font-size : 14px;\r\n}\r\n.cart-empty h1{\r\n  font-size: 20px;\r\n}\r\n.cart-empty a{\r\n  font-size: 13px;\r\n}\r\n.forgot-pw{\r\n  font-size: 15px;\r\n}\r\n.total-counter{\r\n  padding : 2px;\r\n}\r\n.nav-wrapper ul li{\r\n  padding : 1px;\r\n}\r\n}\r\n",".noty_theme__mint.noty_bar {\r\n  margin: 4px 0;\r\n  overflow: hidden;\r\n  border-radius: 2px;\r\n  position: relative;\r\n\r\n  .noty_body {\r\n\tpadding: 10px;\r\n\tfont-size: 14px;\r\n  }\r\n\r\n  .noty_buttons {\r\n\tpadding: 10px;\r\n  }\r\n}\r\n\r\n.noty_theme__mint.noty_type__alert,\r\n.noty_theme__mint.noty_type__notification {\r\n  background-color: #fff;\r\n  border-bottom: 1px solid #D1D1D1;\r\n  color: #2F2F2F;\r\n}\r\n\r\n.noty_theme__mint.noty_type__warning {\r\n  background-color: #FFAE42;\r\n  border-bottom: 1px solid #E89F3C;\r\n  color: #fff;\r\n}\r\n\r\n.noty_theme__mint.noty_type__error {\r\n  background-color: #DE636F;\r\n  border-bottom: 1px solid #CA5A65;\r\n  color: #fff;\r\n}\r\n\r\n.noty_theme__mint.noty_type__info,\r\n.noty_theme__mint.noty_type__information {\r\n  background-color: #7F7EFF;\r\n  border-bottom: 1px solid #7473E8;\r\n  color: #fff;\r\n}\r\n\r\n.noty_theme__mint.noty_type__success {\r\n  background-color: #AFC765;\r\n  border-bottom: 1px solid #A0B55C;\r\n  color: #fff;\r\n}\r\n","// Colors\r\n$primary: #FE5F1E;\r\n$primary-hover: #b23301;\r\n$secondary: #f8f8f8;\r\n$pure:#fff;\r\n$dark:#232323;\r\n$gray:#ccc;\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/cssWithMappingToString.js ***!
  \************************************************************************/
/***/ ((module) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (typeof btoa === 'function') {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
};

/***/ }),

/***/ "./resources/scss/scss.scss":
/*!**********************************!*\
  !*** ./resources/scss/scss.scss ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_scss_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/sass-loader/dist/cjs.js!./scss.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./resources/scss/scss.scss");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_scss_scss__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_scss_scss__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./resources/js/customer/cart.js":
/*!***************************************!*\
  !*** ./resources/js/customer/cart.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scss_scss_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../scss/scss.scss */ "./resources/scss/scss.scss");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_1__);



let dismiss = document.querySelectorAll('.dismissOrderIcon');
dismiss.forEach(dismissIcon => {
  dismissIcon.onclick = dismissOrder;
});

function dismissOrder(event) {
  let icon = event.currentTarget;
  let id = icon.dataset.id;
  icon.style.animation = "shake 2s infinite";
  icon.style.color = "yellow";
  axios__WEBPACK_IMPORTED_MODULE_1___default().post('/cart/dismissorder', {id}).then(res => {
    icon.style.color = "#4BB543";
    icon.style.animation = "none";

    //update the changes in total quantity and total price
    document.querySelector('.total-counter').innerText = res.data.totalQty;
    document.querySelector('.total-price').innerText = res.data.totalPrice;

    slideAndFade(icon.parentElement);
    setTimeout(() => {
      icon.style.color = "orange";
    }, 3000);
  }).catch(() => {
    icon.style.color = "red";
    icon.style.animation = "none";
    setTimeout(() => {
      icon.style.color = "orange";
    }, 3000);
  });
}

function slideAndFade(elem) {
  elem.style.transform = "translateX(300px)";
  elem.style.opacity = "0";
  setTimeout(() => {
    elem.remove();
  }, 2000);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./resources/js/customer/cart.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9yZXNvdXJjZXMvc2Nzcy9zY3NzLnNjc3MiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9yZXNvdXJjZXMvc2Nzcy9zY3NzLnNjc3M/NmY4MSIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL3Jlc291cmNlcy9qcy9jdXN0b21lci9jYXJ0LmpzIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDRGQUF1QyxDOzs7Ozs7Ozs7OztBQ0ExQjs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7QUFDaEMsYUFBYSxtQkFBTyxDQUFDLGlFQUFrQjtBQUN2QyxjQUFjLG1CQUFPLENBQUMseUVBQXNCO0FB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QU0sTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLE1BQU0sTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLEtBQUssS0FBSyxVQUFVLEtBQUssS0FBSyxNQUFNLEtBQUssVUFBVSxLQUFLLEtBQUssTUFBTSxLQUFLLFdBQVcsVUFBVSxLQUFLLEtBQUssTUFBTSxLQUFLLFdBQVcsVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLE1BQU0sVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsV0FBVyxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sWUFBWSxZQUFZLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsV0FBVyxZQUFZLE9BQU8sTUFBTSxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLFlBQVksV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsT0FBTyxNQUFNLFlBQVksWUFBWSxPQUFPLE1BQU0sWUFBWSxZQUFZLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxRQUFRLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxZQUFZLFlBQVksWUFBWSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sWUFBWSxRQUFRLE1BQU0sV0FBVyxPQUFPLE1BQU0sWUFBWSxZQUFZLFdBQVcsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsWUFBWSxPQUFPLE1BQU0sV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFVB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ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgKHV0aWxzLmlzQmxvYihyZXF1ZXN0RGF0YSkgfHwgdXRpbHMuaXNGaWxlKHJlcXVlc3REYXRhKSkgJiZcbiAgICAgIHJlcXVlc3REYXRhLnR5cGVcbiAgICApIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSB8fCAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIi5ub3R5X2xheW91dF9taXhpbiwgI25vdHlfbGF5b3V0X19jZW50ZXJSaWdodCwgI25vdHlfbGF5b3V0X19jZW50ZXJMZWZ0LCAjbm90eV9sYXlvdXRfX2NlbnRlciwgI25vdHlfbGF5b3V0X19ib3R0b21SaWdodCwgI25vdHlfbGF5b3V0X19ib3R0b21DZW50ZXIsICNub3R5X2xheW91dF9fYm90dG9tTGVmdCwgI25vdHlfbGF5b3V0X19ib3R0b20sICNub3R5X2xheW91dF9fdG9wUmlnaHQsICNub3R5X2xheW91dF9fdG9wQ2VudGVyLCAjbm90eV9sYXlvdXRfX3RvcExlZnQsICNub3R5X2xheW91dF9fdG9wIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICB6LWluZGV4OiA5OTk5OTk5O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbiAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgLXdlYmtpdC1mb250LXNtb290aGluZzogc3VicGl4ZWwtYW50aWFsaWFzZWQ7XFxuICBmaWx0ZXI6IGJsdXIoMCk7XFxuICAtd2Via2l0LWZpbHRlcjogYmx1cigwKTtcXG4gIG1heC13aWR0aDogOTAlO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX3RvcCB7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiA1JTtcXG4gIHdpZHRoOiA5MCU7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wTGVmdCB7XFxuICB0b3A6IDIwcHg7XFxuICBsZWZ0OiAyMHB4O1xcbiAgd2lkdGg6IDMyNXB4O1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX3RvcENlbnRlciB7XFxuICB0b3A6IDUlO1xcbiAgbGVmdDogNTAlO1xcbiAgd2lkdGg6IDMyNXB4O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMSwgMSk7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wUmlnaHQge1xcbiAgdG9wOiAyMHB4O1xcbiAgcmlnaHQ6IDIwcHg7XFxuICB3aWR0aDogMzI1cHg7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tIHtcXG4gIGJvdHRvbTogMDtcXG4gIGxlZnQ6IDUlO1xcbiAgd2lkdGg6IDkwJTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19ib3R0b21MZWZ0IHtcXG4gIGJvdHRvbTogMjBweDtcXG4gIGxlZnQ6IDIwcHg7XFxuICB3aWR0aDogMzI1cHg7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tQ2VudGVyIHtcXG4gIGJvdHRvbTogNSU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogMzI1cHg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19ib3R0b21SaWdodCB7XFxuICBib3R0b206IDIwcHg7XFxuICByaWdodDogMjBweDtcXG4gIHdpZHRoOiAzMjVweDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19jZW50ZXIge1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogMzI1cHg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC01MCUgLSAuNXB4KSwgY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMSwgMSk7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyTGVmdCB7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDIwcHg7XFxuICB3aWR0aDogMzI1cHg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19jZW50ZXJSaWdodCB7XFxuICB0b3A6IDUwJTtcXG4gIHJpZ2h0OiAyMHB4O1xcbiAgd2lkdGg6IDMyNXB4O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMSwgMSk7XFxufVxcblxcbi5ub3R5X3Byb2dyZXNzYmFyIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5ub3R5X2hhc190aW1lb3V0Lm5vdHlfaGFzX3Byb2dyZXNzYmFyIC5ub3R5X3Byb2dyZXNzYmFyIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogMDtcXG4gIGJvdHRvbTogMDtcXG4gIGhlaWdodDogM3B4O1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNjQ2NDY0O1xcbiAgb3BhY2l0eTogMC4yO1xcbiAgZmlsdGVyOiBhbHBoYShvcGFjaXR5PTEwKTtcXG59XFxuXFxuLm5vdHlfYmFyIHtcXG4gIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMCkgc2NhbGUoMSwgMSk7XFxuICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBzdWJwaXhlbC1hbnRpYWxpYXNlZDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5ub3R5X2VmZmVjdHNfb3BlbiB7XFxuICBvcGFjaXR5OiAwO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoNTAlKTtcXG4gIGFuaW1hdGlvbjogbm90eV9hbmltX2luIDAuNXMgY3ViaWMtYmV6aWVyKDAuNjgsIC0wLjU1LCAwLjI2NSwgMS41NSk7XFxuICBhbmltYXRpb24tZmlsbC1tb2RlOiBmb3J3YXJkcztcXG59XFxuXFxuLm5vdHlfZWZmZWN0c19jbG9zZSB7XFxuICBhbmltYXRpb246IG5vdHlfYW5pbV9vdXQgMC41cyBjdWJpYy1iZXppZXIoMC42OCwgLTAuNTUsIDAuMjY1LCAxLjU1KTtcXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGZvcndhcmRzO1xcbn1cXG5cXG4ubm90eV9maXhfZWZmZWN0c19oZWlnaHQge1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1faGVpZ2h0IDc1bXMgZWFzZS1vdXQ7XFxufVxcblxcbi5ub3R5X2Nsb3NlX3dpdGhfY2xpY2sge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubm90eV9jbG9zZV9idXR0b24ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAycHg7XFxuICByaWdodDogMnB4O1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAyMHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjA1KTtcXG4gIGJvcmRlci1yYWRpdXM6IDJweDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2Utb3V0O1xcbn1cXG5cXG4ubm90eV9jbG9zZV9idXR0b246aG92ZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjEpO1xcbn1cXG5cXG4ubm90eV9tb2RhbCB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICB6LWluZGV4OiAxMDAwMDtcXG4gIG9wYWNpdHk6IDAuMztcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IDA7XFxufVxcblxcbi5ub3R5X21vZGFsLm5vdHlfbW9kYWxfb3BlbiB7XFxuICBvcGFjaXR5OiAwO1xcbiAgYW5pbWF0aW9uOiBub3R5X21vZGFsX2luIDAuM3MgZWFzZS1vdXQ7XFxufVxcblxcbi5ub3R5X21vZGFsLm5vdHlfbW9kYWxfY2xvc2Uge1xcbiAgYW5pbWF0aW9uOiBub3R5X21vZGFsX291dCAwLjNzIGVhc2Utb3V0O1xcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9pbiB7XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMC4zO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vdHlfbW9kYWxfb3V0IHtcXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vdHlfbW9kYWxfb3V0IHtcXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vdHlfYW5pbV9pbiB7XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCk7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm90eV9hbmltX291dCB7XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoNTAlKTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBub3R5X2FuaW1faGVpZ2h0IHtcXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICB9XFxufVxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfYmFyIHtcXG4gIG1hcmdpbjogNHB4IDA7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X2JhciAubm90eV9ib2R5IHtcXG4gIHBhZGRpbmc6IDEwcHg7XFxuICBmb250LXNpemU6IDE0cHg7XFxufVxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfYmFyIC5ub3R5X2J1dHRvbnMge1xcbiAgcGFkZGluZzogMTBweDtcXG59XFxuXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19hbGVydCxcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX25vdGlmaWNhdGlvbiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNEMUQxRDE7XFxuICBjb2xvcjogIzJGMkYyRjtcXG59XFxuXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX193YXJuaW5nIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNGRkFFNDI7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0U4OUYzQztcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2Vycm9yIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNERTYzNkY7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0NBNUE2NTtcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2luZm8sXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19pbmZvcm1hdGlvbiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjN0Y3RUZGO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICM3NDczRTg7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19zdWNjZXNzIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNBRkM3NjU7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0EwQjU1QztcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4qIHtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuaHRtbCxcXG5ib2R5IHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG5cXG5idXR0b246Zm9jdXMge1xcbiAgb3V0bGluZTogbm9uZTtcXG59XFxuXFxuYm9keSB7XFxuICBmb250LWZhbWlseTogXFxcIkxhdG9cXFwiLCBcXFwic2Fucy1zZXJpZlxcXCI7XFxuICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcblxcbm5hdiB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBtaW4taGVpZ2h0OiAxMjBweDtcXG59XFxuXFxuLm5hdi13cmFwcGVyIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBhZGRpbmc6IDEwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDIwJTtcXG4gIHJpZ2h0OiAxJTtcXG59XFxuXFxuLm5hdi13cmFwcGVyIHVsIGxpIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIG1hcmdpbjogMCAxMHB4O1xcbiAgcGFkZGluZzogNXB4O1xcbiAgZm9udC1zaXplOiAxOHB4O1xcbn1cXG5cXG4ubmF2LXdyYXBwZXIgdWwgbGk6bGFzdC1jaGlsZCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi50b3RhbC1jb3VudGVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJhY2tncm91bmQ6ICM2NGEwZmY7XFxuICBjb2xvcjogd2hpdGU7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHBhZGRpbmc6IDJweCAwcHggMCA2cHg7XFxuICBmb250LXNpemU6IDEzcHg7XFxuICBmb250LXdlaWdodDogYm9sZDtcXG4gIHRvcDogLTEwJTtcXG4gIHJpZ2h0OiAtMjAlO1xcbn1cXG5cXG4ubmF2LXdyYXBwZXIgdWwgbGkgYSB7XFxuICBjb2xvcjogI0ZFNUYxRTtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuXFxuLmNhcnQge1xcbiAgd2lkdGg6IDQ0cHg7XFxuICBoZWlnaHQ6IDMwcHg7XFxufVxcblxcbi5sb2dvLXdyYXBwZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA1JTtcXG4gIGxlZnQ6IDAlO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbn1cXG5cXG4ubG9nby13cmFwcGVyIGltZyB7XFxuICB3aWR0aDogMTUwcHg7XFxuICBoZWlnaHQ6IDEyMHB4O1xcbn1cXG5cXG4ubG9nby13cmFwcGVyIHNwYW4ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA0MCU7XFxuICBsZWZ0OiAxMDAlO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDZweDtcXG4gIGNvbG9yOiAjRkU1RjFFO1xcbiAgZm9udC1zaXplOiAyM3B4O1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG59XFxuXFxuLmludHJvLWNvbnRhaW5lciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDgwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYmFja2dyb3VuZDogI2Y4ZjhmODtcXG4gIGxlZnQ6IDA7XFxufVxcblxcbi5iYW5uZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgcmlnaHQ6IDAlO1xcbiAgdG9wOiAxNCU7XFxuICB3aWR0aDogMzQlO1xcbiAgaGVpZ2h0OiA3OSU7XFxufVxcblxcbi5jYXB0aW9uIHtcXG4gIGZvbnQtc2l6ZTogMjBweDtcXG4gIGxldHRlci1zcGFjaW5nOiAycHg7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA0MCU7XFxuICBsZWZ0OiA1JTtcXG59XFxuXFxuLmNhcHRpb24gaDEge1xcbiAgY29sb3I6ICMyMzIzMjM7XFxuICBmb250LXNpemU6IDUwcHg7XFxuICBsZXR0ZXItc3BhY2luZzogNnB4O1xcbiAgbWFyZ2luOiAyMHB4IDA7XFxufVxcblxcbi5vcmRlciB7XFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcbiAgY29sb3I6ICNmZmY7XFxuICBwYWRkaW5nOiA3cHg7XFxuICBib3JkZXI6IDFweCB3aGl0ZSBzb2xpZDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIHdpZHRoOiA2MCU7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLm9yZGVyOmhvdmVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMyMzIzMjM7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLm5hdi13cmFwcGVyIHVsIGxpIGE6aG92ZXIge1xcbiAgY29sb3I6ICMyMzIzMjM7XFxufVxcblxcbi5tZW51LWNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuXFxuLm1lbnUtY29udGFpbmVyIGgyIHtcXG4gIGZvbnQtc2l6ZTogMzBweDtcXG4gIG1hcmdpbjogMzBweDtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgY29sb3I6ICNGRTVGMUU7XFxuICBsZXR0ZXItc3BhY2luZzogNXB4O1xcbn1cXG5cXG4ubWVudS1pdGVtIGltZyB7XFxuICB3aWR0aDogNTAlO1xcbiAgaGVpZ2h0OiA1MCU7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIG1hcmdpbjogYXV0bztcXG59XFxuXFxuLm1lbnUtaXRlbSAuaXRlbS1uYW1lIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGxldHRlci1zcGFjaW5nOiAycHg7XFxuICBmb250LXNpemU6IDE4cHg7XFxuICBjb2xvcjogIzIzMjMyMztcXG4gIG1hcmdpbjogNXB4IDA7XFxufVxcblxcbi5tZW51LWl0ZW0gLml0ZW0tcHJpY2Uge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgd2lkdGg6IDQwJTtcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxuICBwYWRkaW5nOiA1cHg7XFxuICBwYWRkaW5nLWxlZnQ6IDIwcHg7XFxuICBmb250LXdlaWdodDogNTAwO1xcbiAgY29sb3I6ICMyMzIzMjM7XFxufVxcblxcbi5tZW51LWl0ZW0gYnV0dG9uIHtcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHdvcmQtc3BhY2luZzogMTBweDtcXG4gIHBhZGRpbmc6IDVweDtcXG4gIGJvcmRlcjogMXB4IHdoaXRlIHNvbGlkO1xcbiAgYm9yZGVyLXJhZGl1czogNXB4O1xcbiAgbWFyZ2luLWxlZnQ6IDMwcHg7XFxufVxcblxcbi5tZW51LWl0ZW0gYnV0dG9uOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxufVxcblxcbi5jYXJ0LWVtcHR5IGgxLCAuY2FydC1ub25lbXB0eSBoMSB7XFxuICBjb2xvcjogIzIzMjMyMztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICBmb250LXNpemU6IDMwcHg7XFxuICBtYXJnaW46IDIwcHggMDtcXG4gIGxldHRlci1zcGFjaW5nOiAzcHg7XFxufVxcblxcbi5jYXJ0LWVtcHR5IHAge1xcbiAgZm9udC1zaXplOiAyMHB4O1xcbiAgbWFyZ2luOiBhdXRvO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgcGFkZGluZzogNXB4O1xcbn1cXG5cXG4uaW1nLXdyYXBwZXIge1xcbiAgd2lkdGg6IDQwJTtcXG4gIG1hcmdpbjogYXV0bztcXG59XFxuXFxuLmltZy13cmFwcGVyIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuXFxuLmNhcnQtZW1wdHkgYSB7XFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcbiAgY29sb3I6ICNmZmY7XFxuICBwYWRkaW5nOiA3cHg7XFxuICBib3JkZXI6IDFweCB3aGl0ZSBzb2xpZDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIHdpZHRoOiAxMDBweDtcXG4gIG1hcmdpbjogMTBweCBhdXRvO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5jYXJ0LWVtcHR5IGE6aG92ZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzIzMjMyMztcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4uY2FydC1ub25lbXB0eSB7XFxuICBiYWNrZ3JvdW5kOiAjZjhmOGY4O1xcbiAgbWluLWhlaWdodDogMTAwJTtcXG59XFxuXFxuLmNvdW50ZXItY29udGFpbmVyIHtcXG4gIHdpZHRoOiA3MCU7XFxuICBtYXJnaW46IGF1dG87XFxufVxcblxcbi5jYXJ0LW5vbmVtcHR5IGgxIHtcXG4gIGZvbnQtc2l6ZTogMjBweDtcXG4gIHBhZGRpbmc6IDIwcHg7XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbiAgbGV0dGVyLXNwYWNpbmc6IDJweDtcXG59XFxuXFxuLmNvdW50ZXIge1xcbiAgcGFkZGluZy1ib3R0b206IDE1cHg7XFxuICBib3JkZXItYm90dG9tOiAxcHggI2NjYyBzb2xpZDtcXG59XFxuXFxuLnBpenphLWRpc3BsYXkgaW1nIHtcXG4gIHdpZHRoOiAzMCU7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIG1hcmdpbjogYXV0bztcXG59XFxuXFxuLnBpenphLW5hbWUge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICB3aWR0aDogMTAwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMThweDtcXG4gIGNvbG9yOiAjRkU1RjFFO1xcbn1cXG5cXG4ucGl6emEtc2l6ZSB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAxNnB4O1xcbiAgY29sb3I6ICNjY2M7XFxufVxcblxcbi5waXp6YS1wcmljZSwgLnBpenphLW51bWJlciB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAxOHB4O1xcbiAgY29sb3I6ICMyMzIzMjM7XFxufVxcblxcbi50b3RhbCB7XFxuICBwYWRkaW5nOiAyMHB4O1xcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XFxufVxcblxcbi50b3RhbCBzcGFuIHtcXG4gIGNvbG9yOiAjRkU1RjFFO1xcbiAgcGFkZGluZzogMCA1cHg7XFxufVxcblxcbi5hZGRyZXNzIHtcXG4gIG1hcmdpbjogMTBweCAwO1xcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi5hZGRyZXNzIGlucHV0IHtcXG4gIHdpZHRoOiA0MCU7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgcmlnaHQ6IDA7XFxuICBib3JkZXI6IDFweCAjY2NjIHNvbGlkO1xcbiAgYm9yZGVyLXJhZGl1czogMXB4O1xcbn1cXG5cXG4uYWRkcmVzcyBidXR0b24ge1xcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIHBhZGRpbmc6IDdweDtcXG4gIGZvbnQtc2l6ZTogMTVweDtcXG4gIGJvcmRlcjogMXB4ICNjY2Mgc29saWQ7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDQwcHg7XFxuICByaWdodDogMDtcXG59XFxuXFxuLmxvZ2luLWNvbnRhaW5lciwgLnJlZ2lzdGVyLWNvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kOiAjZjhmOGY4O1xcbn1cXG5cXG4ubG9naW4tY29udGFpbmVyIGlucHV0LCAucmVnaXN0ZXItY29udGFpbmVyIGlucHV0IHtcXG4gIG1hcmdpbjogMjBweCBhdXRvO1xcbn1cXG5cXG4ubG9naW4tYnV0dG9uIHtcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIHBhZGRpbmc6IDEwcHg7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgYm9yZGVyOiAxcHggI2NjYyBzb2xpZDtcXG59XFxuXFxuLmxvZ2luLWJ1dHRvbjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kOiBibGFjaztcXG59XFxuXFxuLmZvcmdvdC1wdyB7XFxuICBjb2xvcjogI0ZFNUYxRTtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcblxcbi5mb3Jnb3QtcHc6aG92ZXIge1xcbiAgY29sb3I6ICMyMzIzMjM7XFxufVxcblxcbi5hdXRoLWVycm9yIHtcXG4gIGNvbG9yOiByZWQ7XFxuICBmb250LXNpemU6IDE0cHg7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4ubG9nZ2VkLWluLW5hbWUge1xcbiAgZm9udC1zaXplOiAxNnB4O1xcbiAgZm9udC13ZWlnaHQ6IDUwMTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMTAlO1xcbiAgcmlnaHQ6IDklO1xcbiAgY29sb3I6IG9yYW5nZTtcXG59XFxuXFxuLm5vdC1sb2dnZWQtaW4tbXNnIHtcXG4gIGNvbG9yOiByZWQ7XFxuICBmb250LXdlaWdodDogNjAwO1xcbiAgZm9udC1zaXplOiAxNnB4O1xcbiAgcGFkZGluZzogMTBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLm5vdC1sb2dnZWQtaW4tbXNnIGEge1xcbiAgY29sb3I6IGJsdWU7XFxuICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBhZGRpbmc6IDAgNXB4O1xcbn1cXG5cXG4ub3JkZXItdGhlYWQge1xcbiAgcGFkZGluZzogNXB4O1xcbiAgYm9yZGVyOiAxcHggc29saWQgZ3JheTtcXG59XFxuXFxuLm9yZGVyLXRoZWFkIGRpdiB7XFxuICBib3JkZXItbGVmdDogMXB4IHNvbGlkIGdyYXk7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5vcmRlci1yb3cge1xcbiAgcGFkZGluZzogNXB4O1xcbiAgdHJhbnNpdGlvbjogYWxsIDNzIGVhc2U7XFxufVxcblxcbi5vcmRlci1yb3cgZGl2IHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHBhZGRpbmc6IDNweDtcXG4gIGJvcmRlci1sZWZ0OiAxcHggc29saWQgZ3JheTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCBncmF5O1xcbn1cXG5cXG5Aa2V5ZnJhbWVzIHNoYWtlIHtcXG4gIDMzJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDUwZGVnKTtcXG4gIH1cXG4gIDY2JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKC01MGRlZyk7XFxuICB9XFxufVxcbi50cmFjay1jb250YWluZXIge1xcbiAgYmFja2dyb3VuZDogI2Y4ZjhmODtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiA2MDBweDtcXG59XFxuXFxuLnRyYWNraW5nLXNlY3Rpb24ge1xcbiAgd2lkdGg6IDcwJTtcXG4gIG1hcmdpbjogMjBweCBhdXRvO1xcbiAgcGFkZGluZy10b3A6IDEwMHB4O1xcbiAgaGVpZ2h0OiA1MDBweDtcXG59XFxuXFxuLm9yZGVyLWluZm8ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG4ub3JkZXItaW5mbyBoMSB7XFxuICBmb250LXdlaWdodDogNjAwO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG5cXG4ub3JkZXItaW5mbyAub3JkZXItaWQge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgcmlnaHQ6IDA7XFxuICBjb2xvcjogb3JhbmdlO1xcbn1cXG5cXG4ub3JkZXItc3RhdHVzIHtcXG4gIG1hcmdpbjogNTBweDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IDE4JTtcXG4gIHRvcDogMyU7XFxufVxcblxcbi5vcmRlci1zdGF0dXMgbGkge1xcbiAgbWFyZ2luOiA1MHB4O1xcbiAgd2lkdGg6IDMwMHB4O1xcbiAgZm9udC1zaXplOiAxNnB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDEuNXB4O1xcbn1cXG5cXG4ub3JkZXItc3RhdHVzIGxpIC5pY29uIHtcXG4gIGZvbnQtc2l6ZTogMzBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHJpZ2h0OiAwO1xcbiAgdG9wOiAtNXB4O1xcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDJzIGVhc2U7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMik7XFxufVxcblxcbi5vcmRlcnMtc21hbGwge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuXFxuLm9yZGVyLXN0YXR1cyBsaTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBiYWNrZ3JvdW5kOiBibGFjaztcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHdpZHRoOiAxMHB4O1xcbiAgaGVpZ2h0OiAxMHB4O1xcbiAgcmlnaHQ6IDg4cHg7XFxuICB0b3A6IDdweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuXFxuLm9yZGVyLXN0YXR1cyBsaTphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGJhY2tncm91bmQ6IGJsYWNrO1xcbiAgd2lkdGg6IDJweDtcXG4gIGhlaWdodDogMTg4JTtcXG4gIG1hcmdpbi10b3A6IDE1cHg7XFxuICByaWdodDogOTJweDtcXG4gIHRvcDogMTBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjUwcHgpIHtcXG4gIC5tZW51LWl0ZW0gLml0ZW0tcHJpY2Uge1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB9XFxuXFxuICAuYmFubmVyIHtcXG4gICAgcmlnaHQ6IDElO1xcbiAgICB0b3A6IDQxJTtcXG4gICAgd2lkdGg6IDQzJTtcXG4gICAgaGVpZ2h0OiAxODBweDtcXG4gIH1cXG5cXG4gIC5vcmRlci1zdGF0dXMge1xcbiAgICBtYXJnaW46IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICB0b3A6IDUlO1xcbiAgfVxcblxcbiAgLm9yZGVyLWluZm8ge1xcbiAgICBwYWRkaW5nOiAxMHB4O1xcbiAgfVxcblxcbiAgLm9yZGVyLWluZm8gaDEge1xcbiAgICBwb3NpdGlvbjogc3RhdGljO1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICB9XFxuXFxuICAub3JkZXItaW5mbyAub3JkZXItaWQge1xcbiAgICBwb3NpdGlvbjogc3RhdGljO1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICB9XFxuXFxuICAudHJhY2tpbmctc2VjdGlvbiB7XFxuICAgIHBhZGRpbmctdG9wOiAzNnB4O1xcbiAgfVxcblxcbiAgLm9yZGVyLXN0YXR1cyBsaSB7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gICAgbWFyZ2luOiAzMHB4O1xcbiAgfVxcblxcbiAgLnRyYWNraW5nLWNvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNDUwcHg7XFxuICB9XFxuXFxuICAudHJhY2tpbmctc2VjdGlvbiB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgfVxcblxcbiAgLm9yZGVycy1zbWFsbCB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgfVxcblxcbiAgLnN1Y2Nlc3MtYWxlcnQge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICB9XFxuXFxuICAub3JkZXJzIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG5cXG4gIC5hdXRoLWVycm9yIHtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgfVxcblxcbiAgLmNhcHRpb24ge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICAgIHRvcDogMTclO1xcbiAgICBsZWZ0OiA0JTtcXG4gIH1cXG5cXG4gIC5vcmRlciB7XFxuICAgIHdpZHRoOiA1MCU7XFxuICB9XFxuXFxuICAuY2FwdGlvbiBoMSB7XFxuICAgIGZvbnQtc2l6ZTogMzVweDtcXG4gIH1cXG5cXG4gIC5pbnRyby1jb250YWluZXIge1xcbiAgICBoZWlnaHQ6IDUwJTtcXG4gIH1cXG5cXG4gIC5tZW51LWNvbnRhaW5lciBoMiB7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gIH1cXG5cXG4gIC5tZW51LWl0ZW0gaW1nIHtcXG4gICAgaGVpZ2h0OiA5MHB4O1xcbiAgfVxcblxcbiAgLm1lbnUtaXRlbSAuaXRlbS1uYW1lIHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgfVxcblxcbiAgLmxvZ28td3JhcHBlciBpbWcge1xcbiAgICBtYXJnaW46IDVweDtcXG4gICAgZGlzcGxheTogaW5saW5lO1xcbiAgICBoZWlnaHQ6IDEwMHB4O1xcbiAgfVxcblxcbiAgLmxvZ28td3JhcHBlciB7XFxuICAgIHBvc2l0aW9uOiBzdGF0aWM7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICB9XFxuXFxuICAubG9nby13cmFwcGVyIHNwYW4ge1xcbiAgICBwb3NpdGlvbjogc3RhdGljO1xcbiAgfVxcblxcbiAgLm5hdi13cmFwcGVyIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgcG9zaXRpb246IHN0YXRpYztcXG4gIH1cXG5cXG4gIC5jYXJ0LW5vbmVtcHR5IGgxIHtcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbiAgfVxcblxcbiAgLm5vdC1sb2dnZWQtaW4tbXNnIHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgfVxcblxcbiAgLnRvdGFsIHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgfVxcblxcbiAgLnBpenphLW5hbWUsIC5waXp6YS1zaXplLCAucGl6emEtbnVtYmVyLCAucGl6emEtcHJpY2Uge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICB9XFxuXFxuICAuY2FydC1ub25lbXB0eSB7XFxuICAgIG1pbi1oZWlnaHQ6IDA7XFxuICB9XFxuXFxuICAuc2lnbi1pbi1tc2cge1xcbiAgICBmb250LXNpemU6IDE2cHg7XFxuICB9XFxuXFxuICAubG9naW4tY29udGFpbmVyIGlucHV0LCAucmVnaXN0ZXItY29udGFpbmVyIGlucHV0IHtcXG4gICAgcGFkZGluZzogNXB4O1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICAgIG1hcmdpbjogMjBweCBhdXRvO1xcbiAgfVxcblxcbiAgLmxvZ2luLWJ1dHRvbiB7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gIH1cXG5cXG4gIC5hZGRyZXNzIGlucHV0IHtcXG4gICAgd2lkdGg6IDgwJTtcXG4gIH1cXG5cXG4gIC5hZGRyZXNzIGJ1dHRvbiB7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gIH1cXG5cXG4gIC5sb2dnZWQtaW4tbmFtZSB7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gICAgdG9wOiA1JTtcXG4gIH1cXG5cXG4gIC5jYXJ0LWVtcHR5IHAge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICB9XFxuXFxuICAuY2FydC1lbXB0eSBoMSB7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gIH1cXG5cXG4gIC5jYXJ0LWVtcHR5IGEge1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICB9XFxuXFxuICAuZm9yZ290LXB3IHtcXG4gICAgZm9udC1zaXplOiAxNXB4O1xcbiAgfVxcblxcbiAgLnRvdGFsLWNvdW50ZXIge1xcbiAgICBwYWRkaW5nOiAycHg7XFxuICB9XFxuXFxuICAubmF2LXdyYXBwZXIgdWwgbGkge1xcbiAgICBwYWRkaW5nOiAxcHg7XFxuICB9XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL25vZGVfbW9kdWxlcy9ub3R5L3NyYy9ub3R5LnNjc3NcIixcIndlYnBhY2s6Ly8uL3Jlc291cmNlcy9zY3NzL3Njc3Muc2Nzc1wiLFwid2VicGFjazovLy4vbm9kZV9tb2R1bGVzL25vdHkvc3JjL3RoZW1lcy9taW50LnNjc3NcIixcIndlYnBhY2s6Ly8uL3Jlc291cmNlcy9zY3NzL192YXJpYWJsZXMuc2Nzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFJQTtFQUNFLGVBQUE7RUFDQSxTQUFBO0VBQ0EsVUFBQTtFQUNBLGdCQUFBO0VBQ0Esb0NBQUE7RUFDQSwyQkFBQTtFQUNBLDRDQUFBO0VBQ0EsZUFBQTtFQUNBLHVCQUFBO0VBQ0EsY0FBQTtBQ0hGOztBRE1BO0VBRUUsTUFBQTtFQUNBLFFBQUE7RUFDQSxVQUFBO0FDSkY7O0FET0E7RUFFRSxTQXhCa0I7RUF5QmxCLFVBekJrQjtFQTBCbEIsWUEzQm1CO0FDc0JyQjs7QURRQTtFQUVFLE9BQUE7RUFDQSxTQUFBO0VBQ0EsWUFsQ21CO0VBbUNuQixpRUFBQTtBQ05GOztBRFNBO0VBRUUsU0F2Q2tCO0VBd0NsQixXQXhDa0I7RUF5Q2xCLFlBMUNtQjtBQ21DckI7O0FEVUE7RUFFRSxTQUFBO0VBQ0EsUUFBQTtFQUNBLFVBQUE7QUNSRjs7QURXQTtFQUVFLFlBckRrQjtFQXNEbEIsVUF0RGtCO0VBdURsQixZQXhEbUI7QUMrQ3JCOztBRFlBO0VBRUUsVUFBQTtFQUNBLFNBQUE7RUFDQSxZQS9EbUI7RUFnRW5CLGlFQUFBO0FDVkY7O0FEYUE7RUFFRSxZQXBFa0I7RUFxRWxCLFdBckVrQjtFQXNFbEIsWUF2RW1CO0FDNERyQjs7QURjQTtFQUVFLFFBQUE7RUFDQSxTQUFBO0VBQ0EsWUE5RW1CO0VBK0VuQixvRkFBQTtBQ1pGOztBRGVBO0VBRUUsUUFBQTtFQUNBLFVBcEZrQjtFQXFGbEIsWUF0Rm1CO0VBdUZuQixvRUFBQTtBQ2JGOztBRGdCQTtFQUVFLFFBQUE7RUFDQSxXQTVGa0I7RUE2RmxCLFlBOUZtQjtFQStGbkIsb0VBQUE7QUNkRjs7QURpQkE7RUFDRSxhQUFBO0FDZEY7O0FEaUJBO0VBQ0UsY0FBQTtFQUNBLGtCQUFBO0VBQ0EsT0FBQTtFQUNBLFNBQUE7RUFDQSxXQUFBO0VBQ0EsV0FBQTtFQUNBLHlCQUFBO0VBQ0EsWUFBQTtFQUNBLHlCQUFBO0FDZEY7O0FEaUJBO0VBQ0UsbUNBQUE7RUFDQSw0REFBQTtFQUNBLHNDQUFBO0VBQ0EsNENBQUE7RUFDQSxnQkFBQTtBQ2RGOztBRGlCQTtFQUNFLFVBQUE7RUFDQSx5QkFBQTtFQUNBLG1FQUFBO0VBQ0EsNkJBQUE7QUNkRjs7QURpQkE7RUFDRSxvRUFBQTtFQUNBLDZCQUFBO0FDZEY7O0FEaUJBO0VBQ0UseUNBQUE7QUNkRjs7QURpQkE7RUFDRSxlQUFBO0FDZEY7O0FEaUJBO0VBQ0Usa0JBQUE7RUFDQSxRQUFBO0VBQ0EsVUFBQTtFQUNBLGlCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGlCQUFBO0VBQ0EscUNBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7RUFDQSw2QkFBQTtBQ2RGOztBRGlCQTtFQUNFLG9DQUFBO0FDZEY7O0FEaUJBO0VBQ0UsZUFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0Esc0JBQUE7RUFDQSxjQUFBO0VBQ0EsWUFBQTtFQUNBLE9BQUE7RUFDQSxNQUFBO0FDZEY7O0FEaUJBO0VBQ0UsVUFBQTtFQUNBLHNDQUFBO0FDZEY7O0FEZ0JBO0VBQ0UsdUNBQUE7RUFDQSw2QkFBQTtBQ2JGOztBRGdCQTtFQUNFO0lBQ0UsWUFBQTtFQ2JGO0FBQ0Y7QURlQTtFQUNFO0lBQ0UsVUFBQTtFQ2JGO0FBQ0Y7QURnQkE7RUFDRTtJQUNFLFVBQUE7RUNkRjtBQUNGO0FEaUJBO0VBQ0U7SUFDRSx1QkFBQTtJQUNBLFVBQUE7RUNmRjtBQUNGO0FEa0JBO0VBQ0U7SUFDRSx5QkFBQTtJQUNBLFVBQUE7RUNoQkY7QUFDRjtBRG1CQTtFQUNFO0lBQ0UsU0FBQTtFQ2pCRjtBQUNGO0FDdk1BO0VBQ0UsYUFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxrQkFBQTtBRHlNRjtBQ3ZNRTtFQUNELGFBQUE7RUFDQSxlQUFBO0FEeU1EO0FDdE1FO0VBQ0QsYUFBQTtBRHdNRDs7QUNwTUE7O0VBRUUsc0JBQUE7RUFDQSxnQ0FBQTtFQUNBLGNBQUE7QUR1TUY7O0FDcE1BO0VBQ0UseUJBQUE7RUFDQSxnQ0FBQTtFQUNBLFdBQUE7QUR1TUY7O0FDcE1BO0VBQ0UseUJBQUE7RUFDQSxnQ0FBQTtFQUNBLFdBQUE7QUR1TUY7O0FDcE1BOztFQUVFLHlCQUFBO0VBQ0EsZ0NBQUE7RUFDQSxXQUFBO0FEdU1GOztBQ3BNQTtFQUNFLHlCQUFBO0VBQ0EsZ0NBQUE7RUFDQSxXQUFBO0FEdU1GOztBQWpQQTtFQUNFLFNBQUE7QUFvUEY7O0FBalBBOztFQUVFLFlBQUE7RUFDQSxXQUFBO0FBb1BGOztBQWpQQTtFQUNFLGFBQUE7QUFvUEY7O0FBalBBO0VBQ0UsaUNBQUE7RUFDQSxtQ0FBQTtFQUNBLGNBQUE7RUFDQSxXQUFBO0FBb1BGOztBQWpQQTtFQUNFLGtCQUFBO0VBQ0EsaUJBQUE7QUFvUEY7O0FBalBBO0VBQ0UscUJBQUE7RUFDQSxhQUFBO0VBQ0Esa0JBQUE7RUFDQSxRQUFBO0VBQ0EsU0FBQTtBQW9QRjs7QUFqUEE7RUFDRSxxQkFBQTtFQUNBLGNBQUE7RUFDQSxZQUFBO0VBQ0EsZUFBQTtBQW9QRjs7QUFqUEE7RUFDQSxrQkFBQTtBQW9QQTs7QUFqUEE7RUFDSSxrQkFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxzQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLFNBQUE7RUFDQSxXQUFBO0FBb1BKOztBQWpQQTtFQUNFLGNBQUE7RUFDQSxxQkFBQTtBQW9QRjs7QUFqUEE7RUFDRSxXQUFBO0VBQ0EsWUFBQTtBQW9QRjs7QUFqUEE7RUFDRSxrQkFBQTtFQUNBLE9BQUE7RUFDQSxRQUFBO0VBQ0EscUJBQUE7QUFvUEY7O0FBalBBO0VBQ0UsWUFBQTtFQUNBLGFBQUE7QUFvUEY7O0FBalBBO0VBQ0Usa0JBQUE7RUFDQSxRQUFBO0VBQ0EsVUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtFQUNBLGVBQUE7RUFDQSxnQkFBQTtBQW9QRjs7QUFqUEE7RUFDRSxrQkFBQTtFQUNBLFdBQUE7RUFDQSxXQUFBO0VBQ0EsbUJBQUE7RUFDQSxPQUFBO0FBb1BGOztBQWpQQTtFQUNFLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLFFBQUE7RUFDQSxVQUFBO0VBQ0EsV0FBQTtBQW9QRjs7QUFqUEE7RUFDRSxlQUFBO0VBQ0EsbUJBQUE7RUFDQSxhQUFBO0VBQ0Esa0JBQUE7RUFDQSxRQUFBO0VBQ0EsUUFBQTtBQW9QRjs7QUFqUEE7RUFDRSxjQUFBO0VBQ0EsZUFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtBQW9QRjs7QUFqUEE7RUFDRSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0EsdUJBQUE7RUFDQSxrQkFBQTtFQUNBLHFCQUFBO0VBQ0EsVUFBQTtFQUNBLGNBQUE7RUFDQSxrQkFBQTtBQW9QRjs7QUFqUEE7RUFDQSx5QkV0SU07RUZ1SU4sV0V4SU07QUY0WE47O0FBaFBBO0VBQ0UsY0FBQTtBQW1QRjs7QUFoUEE7RUFDRSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxXQUFBO0FBbVBGOztBQWhQQTtFQUNFLGVBQUE7RUFDQSxZQUFBO0VBQ0EsaUJBQUE7RUFDQSxjRTdKUTtFRjhKUixtQkFBQTtBQW1QRjs7QUFoUEE7RUFDRSxVQUFBO0VBQ0EsV0FBQTtFQUNBLGNBQUE7RUFDQSxZQUFBO0FBbVBGOztBQWhQQTtFQUNFLGNBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsbUJBQUE7RUFDQSxlQUFBO0VBQ0EsY0FBQTtFQUNBLGFBQUE7QUFtUEY7O0FBaFBBO0VBQ0UscUJBQUE7RUFDQSxVQUFBO0VBQ0EsZ0JBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGNBQUE7QUFtUEY7O0FBaFBBO0VBQ0UsbUJBQUE7RUFDQSxXQUFBO0VBQ0Esa0JBQUE7RUFDQSxZQUFBO0VBQ0EsdUJBQUE7RUFDQSxrQkFBQTtFQUNBLGlCQUFBO0FBbVBGOztBQS9PQTtFQUNFLGFBQUE7QUFrUEY7O0FBL09BO0VBQ0UsY0V4TUk7RUZ5TUosa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxjQUFBO0VBQ0EsbUJBQUE7QUFrUEY7O0FBL09BO0VBQ0UsZUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLFlBQUE7QUFrUEY7O0FBL09BO0VBQ0UsVUFBQTtFQUNBLFlBQUE7QUFrUEY7O0FBL09BO0VBQ0UsV0FBQTtFQUNBLFlBQUE7QUFrUEY7O0FBL09BO0VBQ0UsbUJBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLHVCQUFBO0VBQ0Esa0JBQUE7RUFDQSxxQkFBQTtFQUNBLFlBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxrQkFBQTtBQWtQRjs7QUEvT0E7RUFDQSx5QkUvT007RUZnUE4sV0VqUE07QUZtZU47O0FBL09BO0VBQ0UsbUJFdFBVO0VGdVBWLGdCQUFBO0FBa1BGOztBQS9PQTtFQUNFLFVBQUE7RUFDQSxZQUFBO0FBa1BGOztBQS9PQTtFQUNFLGVBQUE7RUFDQSxhQUFBO0VBQ0EsZ0JBQUE7RUFDQSxtQkFBQTtBQWtQRjs7QUEvT0E7RUFDQSxvQkFBQTtFQUNBLDZCQUFBO0FBa1BBOztBQTlPQTtFQUNBLFVBQUE7RUFDQSxjQUFBO0VBQ0EsWUFBQTtBQWlQQTs7QUE5T0E7RUFDRSxjQUFBO0VBQ0EsV0FBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLGNFelJRO0FGMGdCVjs7QUE5T0E7RUFDRSxjQUFBO0VBQ0EsV0FBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLFdFNVJJO0FGNmdCTjs7QUE5T0E7RUFDRSxjQUFBO0VBQ0EsV0FBQTtFQUNBLGtCQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0VBQ0EsY0V0U0k7QUZ1aEJOOztBQTlPQTtFQUNFLGFBQUE7RUFDQyxpQkFBQTtBQWlQSDs7QUE5T0E7RUFDQyxjRW5UUztFRm9UVCxjQUFBO0FBaVBEOztBQTlPQTtFQUNFLGNBQUE7RUFDQSxpQkFBQTtFQUNBLGtCQUFBO0FBaVBGOztBQTlPQTtFQUNFLFVBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxhQUFBO0VBQ0EsUUFBQTtFQUNBLHNCQUFBO0VBQ0Esa0JBQUE7QUFpUEY7O0FBOU9BO0VBQ0UsbUJFeFVRO0VGeVVSLFdFdFVJO0VGdVVKLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLGVBQUE7RUFDQSxzQkFBQTtFQUNBLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLFFBQUE7QUFpUEY7O0FBNU9BO0VBQ0UsbUJFcFZVO0FGbWtCWjs7QUE1T0E7RUFDRSxpQkFBQTtBQStPRjs7QUE1T0E7RUFDRSxtQkU5VlE7RUYrVlIsV0U1Vkk7RUY2VkosZUFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHNCQUFBO0FBK09GOztBQTVPQTtFQUNFLGlCQUFBO0FBK09GOztBQTdPQTtFQUNFLGNFMVdRO0VGMldSLGdCQUFBO0FBZ1BGOztBQTdPQTtFQUNFLGNFM1dJO0FGMmxCTjs7QUE3T0E7RUFDRSxVQUFBO0VBQ0EsZUFBQTtFQUNBLGFBQUE7RUFDQSxrQkFBQTtBQWdQRjs7QUE3T0E7RUFDRSxlQUFBO0VBQ0YsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0VBQ0EsYUFBQTtBQWdQQTs7QUE3T0E7RUFDRSxVQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsYUFBQTtFQUNBLGtCQUFBO0FBZ1BGOztBQTdPQTtFQUNFLFdBQUE7RUFDQSwwQkFBQTtFQUNBLHFCQUFBO0VBQ0EsY0FBQTtBQWdQRjs7QUE3T0E7RUFDRSxZQUFBO0VBQ0Esc0JBQUE7QUFnUEY7O0FBN09BO0VBQ0UsMkJBQUE7RUFDQSxrQkFBQTtBQWdQRjs7QUE3T0E7RUFDRSxZQUFBO0VBQ0EsdUJBQUE7QUFnUEY7O0FBN09BO0VBQ0Usa0JBQUE7RUFDQSxZQUFBO0VBQ0EsMkJBQUE7RUFDQSw2QkFBQTtBQWdQRjs7QUE3T0E7RUFDRTtJQUNFLHdCQUFBO0VBZ1BGO0VBN09BO0lBQ0UseUJBQUE7RUErT0Y7QUFDRjtBQTVPQTtFQUNFLG1CQUFBO0VBQ0EsV0FBQTtFQUNBLGFBQUE7QUE4T0Y7O0FBM09BO0VBQ0UsVUFBQTtFQUNBLGlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxhQUFBO0FBOE9GOztBQTNPQTtFQUNFLGtCQUFBO0FBOE9GOztBQTNPQTtFQUNFLGdCQUFBO0VBQ0Ysa0JBQUE7QUE4T0E7O0FBM09BO0VBQ0Usa0JBQUE7RUFDRSxRQUFBO0VBQ0EsYUFBQTtBQThPSjs7QUEzT0E7RUFDRSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxTQUFBO0VBQ0EsT0FBQTtBQThPRjs7QUEzT0E7RUFDRSxZQUFBO0VBQ0EsWUFBQTtFQUNFLGVBQUE7RUFDQSxrQkFBQTtFQUNBLHFCQUFBO0FBOE9KOztBQTNPQTtFQUNFLGVBQUE7RUFDQSxrQkFBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0VBQ0EsNkJBQUE7RUFDQSxxQkFBQTtBQThPRjs7QUEzT0E7RUFDRSxhQUFBO0FBOE9GOztBQTNPQTtFQUNFLFdBQUE7RUFDQSxpQkFBQTtFQUNBLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsUUFBQTtFQUNBLGtCQUFBO0FBOE9GOztBQTNPQTtFQUNFLFdBQUE7RUFDRSxpQkFBQTtFQUNBLFVBQUE7RUFDQSxZQUFBO0VBQ0EsZ0JBQUE7RUFDQSxXQUFBO0VBQ0EsU0FBQTtFQUNBLGtCQUFBO0FBOE9KOztBQTFPQTtFQUNFO0lBQ0Usa0JBQUE7RUE2T0Y7O0VBM09BO0lBQ0UsU0FBQTtJQUNELFFBQUE7SUFDQSxVQUFBO0lBQ0EsYUFBQTtFQThPRDs7RUEzT0Q7SUFDRSxTQUFBO0lBQ0EsT0FBQTtJQUNBLFdBQUE7SUFDQSxPQUFBO0VBOE9EOztFQTNPRDtJQUNFLGFBQUE7RUE4T0Q7O0VBM09EO0lBQ0UsZ0JBQUE7SUFDQSxlQUFBO0VBOE9EOztFQTNPRDtJQUNFLGdCQUFBO0lBQ0EsZUFBQTtFQThPRDs7RUEzT0Q7SUFDRSxpQkFBQTtFQThPRDs7RUEzT0Q7SUFDRSxlQUFBO0lBQ0EsWUFBQTtFQThPRDs7RUEzT0Q7SUFDRSxhQUFBO0VBOE9EOztFQTNPRDtJQUNFLFdBQUE7RUE4T0Q7O0VBM09EO0lBQ0UsY0FBQTtFQThPRDs7RUE1T0Q7SUFDRSxlQUFBO0VBK09EOztFQTdPRDtJQUNFLGFBQUE7RUFnUEQ7O0VBOU9EO0lBQ0UsZUFBQTtFQWlQRDs7RUEvT0E7SUFDRSxlQUFBO0lBQ0EsUUFBQTtJQUNBLFFBQUE7RUFrUEY7O0VBaFBGO0lBQ0UsVUFBQTtFQW1QQTs7RUFqUEY7SUFDRSxlQUFBO0VBb1BBOztFQWxQRjtJQUNFLFdBQUE7RUFxUEE7O0VBblBGO0lBQ0UsZUFBQTtFQXNQQTs7RUFwUEY7SUFDRSxZQUFBO0VBdVBBOztFQXJQRjtJQUNFLGVBQUE7RUF3UEE7O0VBdFBGO0lBQ0UsV0FBQTtJQUNFLGVBQUE7SUFDQSxhQUFBO0VBeVBGOztFQXZQRjtJQUNFLGdCQUFBO0lBQ0Esa0JBQUE7SUFDQSxjQUFBO0VBMFBBOztFQXhQRjtJQUNFLGdCQUFBO0VBMlBBOztFQXpQRjtJQUNFLGNBQUE7SUFDQSxrQkFBQTtJQUNBLGdCQUFBO0VBNFBBOztFQTFQRjtJQUNFLGVBQUE7RUE2UEE7O0VBM1BGO0lBQ0UsZUFBQTtJQUNBLFVBQUE7RUE4UEE7O0VBNVBGO0lBQ0UsZUFBQTtFQStQQTs7RUE1UEY7SUFDRSxlQUFBO0VBK1BBOztFQTdQRjtJQUNFLGFBQUE7RUFnUUE7O0VBOVBGO0lBQ0UsZUFBQTtFQWlRQTs7RUE5UEY7SUFDRSxZQUFBO0lBQ0UsZUFBQTtJQUNBLGlCQUFBO0VBaVFGOztFQS9QRjtJQUNFLGVBQUE7RUFrUUE7O0VBaFFGO0lBQ0UsVUFBQTtFQW1RQTs7RUFqUUY7SUFDRSxlQUFBO0VBb1FBOztFQWxRRjtJQUNFLGVBQUE7SUFDQSxPQUFBO0VBcVFBOztFQW5RRjtJQUNFLGVBQUE7RUFzUUE7O0VBcFFGO0lBQ0UsZUFBQTtFQXVRQTs7RUFyUUY7SUFDRSxlQUFBO0VBd1FBOztFQXRRRjtJQUNFLGVBQUE7RUF5UUE7O0VBdlFGO0lBQ0UsWUFBQTtFQTBRQTs7RUF4UUY7SUFDRSxZQUFBO0VBMlFBO0FBQ0ZcIixcInNvdXJjZXNDb250ZW50XCI6W1wiJG5vdHktcHJpbWFyeS1jb2xvcjogIzMzMztcXG4kbm90eS1kZWZhdWx0LXdpZHRoOiAzMjVweDtcXG4kbm90eS1jb3JuZXItc3BhY2U6IDIwcHg7XFxuXFxuLm5vdHlfbGF5b3V0X21peGluIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICB6LWluZGV4OiA5OTk5OTk5O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVaKDApIHNjYWxlKDEuMCwgMS4wKTtcXG4gIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IHN1YnBpeGVsLWFudGlhbGlhc2VkO1xcbiAgZmlsdGVyOiBibHVyKDApO1xcbiAgLXdlYmtpdC1maWx0ZXI6IGJsdXIoMCk7XFxuICBtYXgtd2lkdGg6IDkwJTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3Age1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6IDA7XFxuICBsZWZ0OiA1JTtcXG4gIHdpZHRoOiA5MCU7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wTGVmdCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIHRvcDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgbGVmdDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wQ2VudGVyIHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgdG9wOiA1JTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAkbm90eS1kZWZhdWx0LXdpZHRoO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMS4wLCAxLjApO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX3RvcFJpZ2h0IHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgdG9wOiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICByaWdodDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tIHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgYm90dG9tOiAwO1xcbiAgbGVmdDogNSU7XFxuICB3aWR0aDogOTAlO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbUxlZnQge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICBib3R0b206ICRub3R5LWNvcm5lci1zcGFjZTtcXG4gIGxlZnQ6ICRub3R5LWNvcm5lci1zcGFjZTtcXG4gIHdpZHRoOiAkbm90eS1kZWZhdWx0LXdpZHRoO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbUNlbnRlciB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIGJvdHRvbTogNSU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEuMCwgMS4wKTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19ib3R0b21SaWdodCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIGJvdHRvbTogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgcmlnaHQ6ICRub3R5LWNvcm5lci1zcGFjZTtcXG4gIHdpZHRoOiAkbm90eS1kZWZhdWx0LXdpZHRoO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2NlbnRlciB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC01MCUgLSAuNXB4KSwgY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMS4wLCAxLjApO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2NlbnRlckxlZnQge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6ICRub3R5LWNvcm5lci1zcGFjZTtcXG4gIHdpZHRoOiAkbm90eS1kZWZhdWx0LXdpZHRoO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMS4wLCAxLjApO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2NlbnRlclJpZ2h0IHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgdG9wOiA1MCU7XFxuICByaWdodDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG59XFxuXFxuLm5vdHlfcHJvZ3Jlc3NiYXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuXFxuLm5vdHlfaGFzX3RpbWVvdXQubm90eV9oYXNfcHJvZ3Jlc3NiYXIgLm5vdHlfcHJvZ3Jlc3NiYXIge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBsZWZ0OiAwO1xcbiAgYm90dG9tOiAwO1xcbiAgaGVpZ2h0OiAzcHg7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM2NDY0NjQ7XFxuICBvcGFjaXR5OiAwLjI7XFxuICBmaWx0ZXI6IGFscGhhKG9wYWNpdHk9MTApXFxufVxcblxcbi5ub3R5X2JhciB7XFxuICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMCkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLjAsIDEuMCk7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKSBzY2FsZSgxLjAsIDEuMCk7XFxuICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBzdWJwaXhlbC1hbnRpYWxpYXNlZDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5ub3R5X2VmZmVjdHNfb3BlbiB7XFxuICBvcGFjaXR5OiAwO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoNTAlKTtcXG4gIGFuaW1hdGlvbjogbm90eV9hbmltX2luIC41cyBjdWJpYy1iZXppZXIoMC42OCwgLTAuNTUsIDAuMjY1LCAxLjU1KTtcXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGZvcndhcmRzO1xcbn1cXG5cXG4ubm90eV9lZmZlY3RzX2Nsb3NlIHtcXG4gIGFuaW1hdGlvbjogbm90eV9hbmltX291dCAuNXMgY3ViaWMtYmV6aWVyKDAuNjgsIC0wLjU1LCAwLjI2NSwgMS41NSk7XFxuICBhbmltYXRpb24tZmlsbC1tb2RlOiBmb3J3YXJkcztcXG59XFxuXFxuLm5vdHlfZml4X2VmZmVjdHNfaGVpZ2h0IHtcXG4gIGFuaW1hdGlvbjogbm90eV9hbmltX2hlaWdodCA3NW1zIGVhc2Utb3V0O1xcbn1cXG5cXG4ubm90eV9jbG9zZV93aXRoX2NsaWNrIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLm5vdHlfY2xvc2VfYnV0dG9uIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMnB4O1xcbiAgcmlnaHQ6IDJweDtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgd2lkdGg6IDIwcHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsaW5lLWhlaWdodDogMjBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgLjA1KTtcXG4gIGJvcmRlci1yYWRpdXM6IDJweDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIHRyYW5zaXRpb246IGFsbCAuMnMgZWFzZS1vdXQ7XFxufVxcblxcbi5ub3R5X2Nsb3NlX2J1dHRvbjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIC4xKTtcXG59XFxuXFxuLm5vdHlfbW9kYWwge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgei1pbmRleDogMTAwMDA7XFxuICBvcGFjaXR5OiAuMztcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IDA7XFxufVxcblxcbi5ub3R5X21vZGFsLm5vdHlfbW9kYWxfb3BlbiB7XFxuICBvcGFjaXR5OiAwO1xcbiAgYW5pbWF0aW9uOiBub3R5X21vZGFsX2luIC4zcyBlYXNlLW91dDtcXG59XFxuLm5vdHlfbW9kYWwubm90eV9tb2RhbF9jbG9zZSB7XFxuICBhbmltYXRpb246IG5vdHlfbW9kYWxfb3V0IC4zcyBlYXNlLW91dDtcXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGZvcndhcmRzO1xcbn1cXG5cXG5Aa2V5ZnJhbWVzIG5vdHlfbW9kYWxfaW4ge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IC4zO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vdHlfbW9kYWxfb3V0IHtcXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG5vdHlfbW9kYWxfb3V0IHtcXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG5vdHlfYW5pbV9pbiB7XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCk7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9hbmltX291dCB7XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoNTAlKTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBub3R5X2FuaW1faGVpZ2h0IHtcXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICB9XFxufVxcblxcbi8vQGltcG9ydCBcXFwidGhlbWVzL3JlbGF4XFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9tZXRyb3VpXFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9taW50XFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9zdW5zZXRcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL2Jvb3RzdHJhcC12M1xcXCI7XFxuLy9AaW1wb3J0IFxcXCJ0aGVtZXMvYm9vdHN0cmFwLXY0XFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9zZW1hbnRpY3VpXFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9uZXN0XFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9saWdodFxcXCI7XFxuXCIsXCJAaW1wb3J0ICcuL3ZhcmlhYmxlcyc7XFxyXFxuQGltcG9ydCAnfm5vdHkvc3JjL25vdHkuc2Nzcyc7XFxyXFxuQGltcG9ydCAnfm5vdHkvc3JjL3RoZW1lcy9taW50LnNjc3MnO1xcclxcbioge1xcclxcbiAgbWFyZ2luOiAwO1xcclxcbn1cXHJcXG5cXHJcXG5odG1sLFxcclxcbmJvZHkge1xcclxcbiAgaGVpZ2h0OiAxMDAlO1xcclxcbiAgd2lkdGg6IDEwMCU7XFxyXFxufVxcclxcblxcclxcbmJ1dHRvbjpmb2N1c3tcXHJcXG4gIG91dGxpbmU6bm9uZTtcXHJcXG59XFxyXFxuXFxyXFxuYm9keSB7XFxyXFxuICBmb250LWZhbWlseTogXFxcIkxhdG9cXFwiLCBcXFwic2Fucy1zZXJpZlxcXCI7XFxyXFxuICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDtcXHJcXG4gIGNvbG9yOiAjMjMyMzIzO1xcclxcbiAgd2lkdGggOiAxMDAlO1xcclxcbn1cXHJcXG5cXHJcXG5uYXYge1xcclxcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbiAgbWluLWhlaWdodDogMTIwcHg7XFxyXFxufVxcclxcblxcclxcbi5uYXYtd3JhcHBlciB7XFxyXFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxyXFxuICBwYWRkaW5nOiAxMHB4O1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiAyMCU7XFxyXFxuICByaWdodDogMSU7XFxyXFxufVxcclxcblxcclxcbi5uYXYtd3JhcHBlciB1bCBsaSB7XFxyXFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxyXFxuICBtYXJnaW46IDAgMTBweDtcXHJcXG4gIHBhZGRpbmc6IDVweDtcXHJcXG4gIGZvbnQtc2l6ZTogMThweDtcXHJcXG59XFxyXFxuXFxyXFxuLm5hdi13cmFwcGVyIHVsIGxpOmxhc3QtY2hpbGR7XFxyXFxucG9zaXRpb246cmVsYXRpdmU7XFxyXFxufVxcclxcblxcclxcbi50b3RhbC1jb3VudGVyIHtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDEwMCwxNjAsMjU1LDEpO1xcclxcbiAgICBjb2xvcjogd2hpdGU7XFxyXFxuICAgIHdpZHRoOiAyMHB4O1xcclxcbiAgICBoZWlnaHQ6IDIwcHg7XFxyXFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXHJcXG4gICAgcGFkZGluZzogMnB4IDBweCAwIDZweDtcXHJcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcclxcbiAgICBmb250LXdlaWdodDogYm9sZDtcXHJcXG4gICAgdG9wOiAtMTAlO1xcclxcbiAgICByaWdodDogLTIwJTtcXHJcXG59XFxyXFxuXFxyXFxuLm5hdi13cmFwcGVyIHVsIGxpIGEge1xcclxcbiAgY29sb3I6ICNGRTVGMUU7XFxyXFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxyXFxufVxcclxcblxcclxcbi5jYXJ0IHtcXHJcXG4gIHdpZHRoOiA0NHB4O1xcclxcbiAgaGVpZ2h0OiAzMHB4O1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nby13cmFwcGVyIHtcXHJcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gIHRvcDogNSU7XFxyXFxuICBsZWZ0OiAwJTtcXHJcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ28td3JhcHBlciBpbWcge1xcclxcbiAgd2lkdGg6IDE1MHB4O1xcclxcbiAgaGVpZ2h0OiAxMjBweDtcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ28td3JhcHBlciBzcGFuIHtcXHJcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gIHRvcDogNDAlO1xcclxcbiAgbGVmdDogMTAwJTtcXHJcXG4gIGxldHRlci1zcGFjaW5nOiA2cHg7XFxyXFxuICBjb2xvcjogI0ZFNUYxRTtcXHJcXG4gIGZvbnQtc2l6ZTogMjNweDtcXHJcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxyXFxufVxcclxcblxcclxcbi5pbnRyby1jb250YWluZXIge1xcclxcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbiAgaGVpZ2h0OiA4MCU7XFxyXFxuICB3aWR0aDogMTAwJTtcXHJcXG4gIGJhY2tncm91bmQ6ICNmOGY4Zjg7XFxyXFxuICBsZWZ0OiAwO1xcclxcbn1cXHJcXG5cXHJcXG4uYmFubmVyIHtcXHJcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gIHJpZ2h0OiAwJTtcXHJcXG4gIHRvcDogMTQlO1xcclxcbiAgd2lkdGg6IDM0JTtcXHJcXG4gIGhlaWdodDogNzklO1xcclxcbn1cXHJcXG5cXHJcXG4uY2FwdGlvbiB7XFxyXFxuICBmb250LXNpemU6IDIwcHg7XFxyXFxuICBsZXR0ZXItc3BhY2luZzogMnB4O1xcclxcbiAgcGFkZGluZzogMTBweDtcXHJcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gIHRvcDogNDAlO1xcclxcbiAgbGVmdDogNSU7XFxyXFxufVxcclxcblxcclxcbi5jYXB0aW9uIGgxIHtcXHJcXG4gIGNvbG9yOiAjMjMyMzIzO1xcclxcbiAgZm9udC1zaXplOiA1MHB4O1xcclxcbiAgbGV0dGVyLXNwYWNpbmc6IDZweDtcXHJcXG4gIG1hcmdpbjogMjBweCAwO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXIge1xcclxcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXHJcXG4gIGNvbG9yOiAjZmZmO1xcclxcbiAgcGFkZGluZzogN3B4O1xcclxcbiAgYm9yZGVyOiAxcHggd2hpdGUgc29saWQ7XFxyXFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxyXFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxyXFxuICB3aWR0aDogNjAlO1xcclxcbiAgZGlzcGxheTogYmxvY2s7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxufVxcclxcblxcclxcbi5vcmRlcjpob3ZlciB7XFxyXFxuYmFja2dyb3VuZC1jb2xvcjokZGFyaztcXHJcXG5jb2xvcjokcHVyZTtcXHJcXG5cXHJcXG59XFxyXFxuXFxyXFxuLm5hdi13cmFwcGVyIHVsIGxpIGE6aG92ZXIge1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxufVxcclxcblxcclxcbi5tZW51LWNvbnRhaW5lciB7XFxyXFxuICBoZWlnaHQ6IDEwMCU7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICB3aWR0aDogMTAwJTtcXHJcXG59XFxyXFxuXFxyXFxuLm1lbnUtY29udGFpbmVyIGgyIHtcXHJcXG4gIGZvbnQtc2l6ZTogMzBweDtcXHJcXG4gIG1hcmdpbjogMzBweDtcXHJcXG4gIGZvbnQtd2VpZ2h0OmJvbGQ7XFxyXFxuICBjb2xvcjokcHJpbWFyeTtcXHJcXG4gIGxldHRlci1zcGFjaW5nOiA1cHg7XFxyXFxufVxcclxcblxcclxcbi5tZW51LWl0ZW0gaW1nIHtcXHJcXG4gIHdpZHRoOiA1MCU7XFxyXFxuICBoZWlnaHQ6IDUwJTtcXHJcXG4gIGRpc3BsYXk6IGJsb2NrO1xcclxcbiAgbWFyZ2luOiBhdXRvO1xcclxcbn1cXHJcXG5cXHJcXG4ubWVudS1pdGVtIC5pdGVtLW5hbWUge1xcclxcbiAgZGlzcGxheTogYmxvY2s7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICBmb250LXdlaWdodDo3MDA7XFxyXFxuICBsZXR0ZXItc3BhY2luZzogMnB4O1xcclxcbiAgZm9udC1zaXplOiAxOHB4O1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxuICBtYXJnaW46IDVweCAwO1xcclxcbn1cXHJcXG5cXHJcXG4ubWVudS1pdGVtIC5pdGVtLXByaWNlIHtcXHJcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXHJcXG4gIHdpZHRoOiA0MCU7XFxyXFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcclxcbiAgcGFkZGluZzogNXB4O1xcclxcbiAgcGFkZGluZy1sZWZ0OiAyMHB4O1xcclxcbiAgZm9udC13ZWlnaHQ6IDUwMDtcXHJcXG4gIGNvbG9yOiAjMjMyMzIzO1xcclxcbn1cXHJcXG5cXHJcXG4ubWVudS1pdGVtIGJ1dHRvbiB7XFxyXFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcclxcbiAgY29sb3I6ICNmZmY7XFxyXFxuICB3b3JkLXNwYWNpbmc6IDEwcHg7XFxyXFxuICBwYWRkaW5nOiA1cHg7XFxyXFxuICBib3JkZXI6IDFweCB3aGl0ZSBzb2xpZDtcXHJcXG4gIGJvcmRlci1yYWRpdXM6IDVweDtcXHJcXG4gIG1hcmdpbi1sZWZ0OiAzMHB4O1xcclxcbn1cXHJcXG5cXHJcXG5cXHJcXG4ubWVudS1pdGVtIGJ1dHRvbjpmb2N1c3tcXHJcXG4gIG91dGxpbmUgOiBub25lO1xcclxcbn1cXHJcXG5cXHJcXG4uY2FydC1lbXB0eSBoMSwgLmNhcnQtbm9uZW1wdHkgaDF7XFxyXFxuICBjb2xvcjokZGFyaztcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbiAgZm9udC13ZWlnaHQ6NzAwO1xcclxcbiAgZm9udC1zaXplOjMwcHg7XFxyXFxuICBtYXJnaW46MjBweCAwO1xcclxcbiAgbGV0dGVyLXNwYWNpbmc6IDNweDtcXHJcXG59XFxyXFxuXFxyXFxuLmNhcnQtZW1wdHkgcHtcXHJcXG4gIGZvbnQtc2l6ZToyMHB4O1xcclxcbiAgbWFyZ2luOmF1dG87XFxyXFxuICB0ZXh0LWFsaWduOmNlbnRlcjtcXHJcXG4gIHBhZGRpbmc6NXB4O1xcclxcbn1cXHJcXG5cXHJcXG4uaW1nLXdyYXBwZXJ7XFxyXFxuICB3aWR0aDo0MCU7XFxyXFxuICBtYXJnaW46YXV0bztcXHJcXG59XFxyXFxuXFxyXFxuLmltZy13cmFwcGVyIGltZ3tcXHJcXG4gIHdpZHRoOjEwMCU7XFxyXFxuICBoZWlnaHQ6MTAwJTtcXHJcXG59XFxyXFxuXFxyXFxuLmNhcnQtZW1wdHkgYXtcXHJcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxyXFxuICBjb2xvcjogI2ZmZjtcXHJcXG4gIHBhZGRpbmc6IDdweDtcXHJcXG4gIGJvcmRlcjogMXB4IHdoaXRlIHNvbGlkO1xcclxcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcclxcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcclxcbiAgd2lkdGg6IDEwMHB4O1xcclxcbiAgbWFyZ2luOjEwcHggYXV0bztcXHJcXG4gIGRpc3BsYXk6IGJsb2NrO1xcclxcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcclxcbn1cXHJcXG5cXHJcXG4uY2FydC1lbXB0eSBhOmhvdmVyIHtcXHJcXG5iYWNrZ3JvdW5kLWNvbG9yOiRkYXJrO1xcclxcbmNvbG9yOiRwdXJlO1xcclxcbn1cXHJcXG5cXHJcXG4uY2FydC1ub25lbXB0eXtcXHJcXG4gIGJhY2tncm91bmQ6JHNlY29uZGFyeTtcXHJcXG4gIG1pbi1oZWlnaHQ6MTAwJTtcXHJcXG59XFxyXFxuXFxyXFxuLmNvdW50ZXItY29udGFpbmVye1xcclxcbiAgd2lkdGg6NzAlO1xcclxcbiAgbWFyZ2luOmF1dG87XFxyXFxufVxcclxcblxcclxcbi5jYXJ0LW5vbmVtcHR5IGgxe1xcclxcbiAgZm9udC1zaXplOjIwcHg7XFxyXFxuICBwYWRkaW5nOjIwcHg7XFxyXFxuICB0ZXh0LWFsaWduOmxlZnQ7XFxyXFxuICBsZXR0ZXItc3BhY2luZzoycHg7XFxyXFxufVxcclxcblxcclxcbi5jb3VudGVye1xcclxcbnBhZGRpbmctYm90dG9tOjE1cHg7XFxyXFxuYm9yZGVyLWJvdHRvbToxcHggJGdyYXkgc29saWQ7XFxyXFxufVxcclxcblxcclxcblxcclxcbi5waXp6YS1kaXNwbGF5IGltZ3tcXHJcXG53aWR0aDozMCU7XFxyXFxuZGlzcGxheTpibG9jaztcXHJcXG5tYXJnaW46YXV0bztcXHJcXG59XFxyXFxuXFxyXFxuLnBpenphLW5hbWV7XFxyXFxuICBkaXNwbGF5OmJsb2NrO1xcclxcbiAgd2lkdGg6MTAwJTtcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbiAgZm9udC1zaXplOjE4cHg7XFxyXFxuICBjb2xvcjokcHJpbWFyeTtcXHJcXG59XFxyXFxuXFxyXFxuLnBpenphLXNpemV7XFxyXFxuICBkaXNwbGF5OmJsb2NrO1xcclxcbiAgd2lkdGg6MTAwJTtcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbiAgZm9udC1zaXplOjE2cHg7XFxyXFxuICBjb2xvcjokZ3JheTtcXHJcXG59XFxyXFxuXFxyXFxuLnBpenphLXByaWNlLCAucGl6emEtbnVtYmVye1xcclxcbiAgZGlzcGxheTpibG9jaztcXHJcXG4gIHdpZHRoOjEwMCU7XFxyXFxuICBhbGlnbi1zZWxmOmNlbnRlcjtcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbiAgZm9udC1zaXplOjE4cHg7XFxyXFxuICBjb2xvcjokZGFyaztcXHJcXG59XFxyXFxuXFxyXFxuLnRvdGFse1xcclxcbiAgcGFkZGluZzoyMHB4O1xcclxcbiAgIHRleHQtYWxpZ246cmlnaHQ7XFxyXFxufVxcclxcblxcclxcbi50b3RhbCBzcGFue1xcclxcbiBjb2xvcjokcHJpbWFyeTtcXHJcXG4gcGFkZGluZzowIDVweDtcXHJcXG59XFxyXFxuXFxyXFxuLmFkZHJlc3N7XFxyXFxuICBtYXJnaW46MTBweCAwO1xcclxcbiAgdGV4dC1hbGlnbjpyaWdodDtcXHJcXG4gIHBvc2l0aW9uOnJlbGF0aXZlO1xcclxcbn1cXHJcXG5cXHJcXG4uYWRkcmVzcyBpbnB1dHtcXHJcXG4gIHdpZHRoOjQwJTtcXHJcXG4gIGhlaWdodDoyMHB4O1xcclxcbiAgcG9zaXRpb246YWJzb2x1dGU7XFxyXFxuICBwYWRkaW5nOjEwcHg7XFxyXFxuICByaWdodDowO1xcclxcbiAgYm9yZGVyOjFweCAkZ3JheSBzb2xpZDtcXHJcXG4gIGJvcmRlci1yYWRpdXM6MXB4O1xcclxcbn1cXHJcXG5cXHJcXG4uYWRkcmVzcyBidXR0b257XFxyXFxuICBiYWNrZ3JvdW5kOiRwcmltYXJ5O1xcclxcbiAgY29sb3I6JHB1cmU7XFxyXFxuICBib3JkZXItcmFkaXVzOjEwcHg7XFxyXFxuICBwYWRkaW5nOjdweDtcXHJcXG4gIGZvbnQtc2l6ZToxNXB4O1xcclxcbiAgYm9yZGVyOjFweCAkZ3JheSBzb2xpZDtcXHJcXG4gIHBvc2l0aW9uOmFic29sdXRlO1xcclxcbiAgdG9wOjQwcHg7XFxyXFxuICByaWdodDowO1xcclxcbn1cXHJcXG5cXHJcXG4vL2xvZ2luIGFuZCByZWdpc3RyYXRpb25cXHJcXG5cXHJcXG4ubG9naW4tY29udGFpbmVyLCAucmVnaXN0ZXItY29udGFpbmVye1xcclxcbiAgYmFja2dyb3VuZDokc2Vjb25kYXJ5O1xcclxcbn1cXHJcXG5cXHJcXG4ubG9naW4tY29udGFpbmVyIGlucHV0LCAucmVnaXN0ZXItY29udGFpbmVyIGlucHV0e1xcclxcbiAgbWFyZ2luOjIwcHggYXV0bztcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ2luLWJ1dHRvbntcXHJcXG4gIGJhY2tncm91bmQ6JHByaW1hcnk7XFxyXFxuICBjb2xvcjokcHVyZTtcXHJcXG4gIGZvbnQtc2l6ZToxNnB4O1xcclxcbiAgcGFkZGluZzoxMHB4O1xcclxcbiAgYm9yZGVyLXJhZGl1czoxMHB4O1xcclxcbiAgYm9yZGVyOjFweCAkZ3JheSBzb2xpZDtcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ2luLWJ1dHRvbjpob3ZlcntcXHJcXG4gIGJhY2tncm91bmQgOiBibGFjaztcXHJcXG59XFxyXFxuLmZvcmdvdC1wd3tcXHJcXG4gIGNvbG9yOiRwcmltYXJ5O1xcclxcbiAgZm9udC13ZWlnaHQ6NzAwO1xcclxcbn1cXHJcXG5cXHJcXG4uZm9yZ290LXB3OmhvdmVye1xcclxcbiAgY29sb3I6JGRhcms7XFxyXFxufVxcclxcblxcclxcbi5hdXRoLWVycm9ye1xcclxcbiAgY29sb3I6cmVkO1xcclxcbiAgZm9udC1zaXplOjE0cHg7XFxyXFxuICBwYWRkaW5nOjEwcHg7XFxyXFxuICB0ZXh0LWFsaWduOmNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ2dlZC1pbi1uYW1le1xcclxcbiAgZm9udC1zaXplOiAxNnB4O1xcclxcbmZvbnQtd2VpZ2h0OiA1MDE7XFxyXFxucG9zaXRpb246IGFic29sdXRlO1xcclxcbnRvcDogMTAlO1xcclxcbnJpZ2h0OiA5JTtcXHJcXG5jb2xvcjogb3JhbmdlO1xcclxcbn1cXHJcXG5cXHJcXG4ubm90LWxvZ2dlZC1pbi1tc2d7XFxyXFxuICBjb2xvciA6IHJlZDtcXHJcXG4gIGZvbnQtd2VpZ2h0IDogNjAwO1xcclxcbiAgZm9udC1zaXplOjE2cHg7XFxyXFxuICBwYWRkaW5nOjEwcHg7XFxyXFxuICB0ZXh0LWFsaWduOmNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLm5vdC1sb2dnZWQtaW4tbXNnIGF7XFxyXFxuICBjb2xvcjogYmx1ZTtcXHJcXG4gIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xcclxcbiAgZGlzcGxheSA6IGlubGluZS1ibG9jaztcXHJcXG4gIHBhZGRpbmc6IDAgNXB4O1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItdGhlYWR7XFxyXFxuICBwYWRkaW5nIDogNXB4O1xcclxcbiAgYm9yZGVyIDogMXB4IHNvbGlkIGdyYXk7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci10aGVhZCBkaXZ7XFxyXFxuICBib3JkZXItbGVmdCA6IDFweCBzb2xpZCBncmF5O1xcclxcbiAgdGV4dC1hbGlnbiA6IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLXJvd3tcXHJcXG4gIHBhZGRpbmcgOiA1cHg7XFxyXFxuICB0cmFuc2l0aW9uOiBhbGwgM3MgZWFzZTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLXJvdyBkaXZ7XFxyXFxuICB0ZXh0LWFsaWduIDogY2VudGVyO1xcclxcbiAgcGFkZGluZyA6IDNweDtcXHJcXG4gIGJvcmRlci1sZWZ0IDogMXB4IHNvbGlkIGdyYXk7XFxyXFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgZ3JheTtcXHJcXG59XFxyXFxuXFxyXFxuQGtleWZyYW1lcyBzaGFrZXtcXHJcXG4gIDMzJXtcXHJcXG4gICAgdHJhbnNmb3JtIDogcm90YXRlKDUwZGVnKVxcclxcbiAgfVxcclxcblxcclxcbiAgNjYle1xcclxcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgtNTBkZWcpXFxyXFxuICB9XFxyXFxufVxcclxcblxcclxcbi50cmFjay1jb250YWluZXJ7XFxyXFxuICBiYWNrZ3JvdW5kIDogI2Y4ZjhmODtcXHJcXG4gIHdpZHRoIDogMTAwJTtcXHJcXG4gIGhlaWdodCA6IDYwMHB4O1xcclxcbn1cXHJcXG5cXHJcXG4udHJhY2tpbmctc2VjdGlvbntcXHJcXG4gIHdpZHRoIDogNzAlO1xcclxcbiAgbWFyZ2luIDogMjBweCBhdXRvO1xcclxcbiAgcGFkZGluZy10b3AgOiAxMDBweDtcXHJcXG4gIGhlaWdodCA6IDUwMHB4O1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItaW5mb3tcXHJcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLWluZm8gaDF7XFxyXFxuICBmb250LXdlaWdodDogNjAwO1xcclxcbnBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLWluZm8gLm9yZGVyLWlke1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICByaWdodDogMDtcXHJcXG4gICAgY29sb3I6IG9yYW5nZTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLXN0YXR1cyB7XFxyXFxuICBtYXJnaW4gOiA1MHB4O1xcclxcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbiAgbGVmdDogMTglO1xcclxcbiAgdG9wIDogMyU7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1zdGF0dXMgbGl7XFxyXFxuICBtYXJnaW46IDUwcHg7XFxyXFxuICB3aWR0aCA6IDMwMHB4O1xcclxcbiAgICBmb250LXNpemU6IDE2cHg7XFxyXFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXHJcXG4gICAgbGV0dGVyLXNwYWNpbmc6IDEuNXB4O1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItc3RhdHVzIGxpIC5pY29ue1xcclxcbiAgZm9udC1zaXplOiAzMHB4O1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgcmlnaHQ6IDA7XFxyXFxuICB0b3AgOiAtNXB4O1xcclxcbiAgdHJhbnNpdGlvbiA6IHRyYW5zZm9ybSAycyBlYXNlO1xcclxcbiAgdHJhbnNmb3JtIDogc2NhbGUoMS4yKTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVycy1zbWFsbHtcXHJcXG4gIGRpc3BsYXkgOiBub25lO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItc3RhdHVzIGxpOmJlZm9yZXtcXHJcXG4gIGNvbnRlbnQgOiAnJztcXHJcXG4gIGJhY2tncm91bmQgOiBibGFjaztcXHJcXG4gIGJvcmRlci1yYWRpdXMgOiA1MCU7XFxyXFxuICB3aWR0aCA6IDEwcHg7XFxyXFxuICBoZWlnaHQgOiAxMHB4O1xcclxcbiAgcmlnaHQgOiA4OHB4O1xcclxcbiAgdG9wIDogN3B4O1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItc3RhdHVzIGxpOmFmdGVye1xcclxcbiAgY29udGVudDogXFxcIlxcXCI7XFxyXFxuICAgIGJhY2tncm91bmQ6IGJsYWNrO1xcclxcbiAgICB3aWR0aDogMnB4O1xcclxcbiAgICBoZWlnaHQ6IDE4OCU7XFxyXFxuICAgIG1hcmdpbi10b3A6IDE1cHg7XFxyXFxuICAgIHJpZ2h0OiA5MnB4O1xcclxcbiAgICB0b3A6IDEwcHg7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG59XFxyXFxuXFxyXFxuXFxyXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aCA6IDY1MHB4KSB7XFxyXFxuICAubWVudS1pdGVtIC5pdGVtLXByaWNle1xcclxcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICB9XFxyXFxuICAuYmFubmVyIHtcXHJcXG4gICAgcmlnaHQ6IDElO1xcclxcbiAgIHRvcDogNDElO1xcclxcbiAgIHdpZHRoOiA0MyU7XFxyXFxuICAgaGVpZ2h0OiAxODBweDtcXHJcXG4gfVxcclxcblxcclxcbiAub3JkZXItc3RhdHVze1xcclxcbiAgIG1hcmdpbiA6IDA7XFxyXFxuICAgbGVmdCA6IDA7XFxyXFxuICAgd2lkdGggOiAxMDAlO1xcclxcbiAgIHRvcCA6IDUlO1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1pbmZve1xcclxcbiAgIHBhZGRpbmcgOiAxMHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1pbmZvIGgxe1xcclxcbiAgIHBvc2l0aW9uOiBzdGF0aWM7XFxyXFxuICAgZm9udC1zaXplIDogMTRweDtcXHJcXG4gfVxcclxcblxcclxcbiAub3JkZXItaW5mbyAub3JkZXItaWR7XFxyXFxuICAgcG9zaXRpb246IHN0YXRpYztcXHJcXG4gICBmb250LXNpemUgOiAxM3B4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC50cmFja2luZy1zZWN0aW9ue1xcclxcbiAgIHBhZGRpbmctdG9wIDogMzZweDtcXHJcXG4gfVxcclxcblxcclxcbiAub3JkZXItc3RhdHVzIGxpIHtcXHJcXG4gICBmb250LXNpemU6IDEzcHg7XFxyXFxuICAgbWFyZ2luIDogMzBweDtcXHJcXG4gfVxcclxcblxcclxcbiAudHJhY2tpbmctY29udGFpbmVye1xcclxcbiAgIGhlaWdodCA6IDQ1MHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC50cmFja2luZy1zZWN0aW9ue1xcclxcbiAgIHdpZHRoIDogMTAwJTtcXHJcXG4gfVxcclxcblxcclxcbiAub3JkZXJzLXNtYWxse1xcclxcbiAgIGRpc3BsYXk6IGJsb2NrO1xcclxcbiB9XFxyXFxuIC5zdWNjZXNzLWFsZXJ0e1xcclxcbiAgIGZvbnQtc2l6ZTogMTRweDtcXHJcXG4gfVxcclxcbiAub3JkZXJze1xcclxcbiAgIGRpc3BsYXkgOiBub25lO1xcclxcbiB9XFxyXFxuIC5hdXRoLWVycm9ye1xcclxcbiAgIGZvbnQtc2l6ZTogMTNweDtcXHJcXG4gfVxcclxcbiAgLmNhcHRpb257XFxyXFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXHJcXG4gICAgdG9wOiAxNyU7XFxyXFxuICAgIGxlZnQ6IDQlO1xcclxcbn1cXHJcXG4ub3JkZXJ7XFxyXFxuICB3aWR0aCA6IDUwJTtcXHJcXG59XFxyXFxuLmNhcHRpb24gaDF7XFxyXFxuICBmb250LXNpemUgOiAzNXB4O1xcclxcbn1cXHJcXG4uaW50cm8tY29udGFpbmVye1xcclxcbiAgaGVpZ2h0IDogNTAlO1xcclxcbn1cXHJcXG4ubWVudS1jb250YWluZXIgaDJ7XFxyXFxuICBmb250LXNpemUgOiAyMHB4O1xcclxcbn1cXHJcXG4ubWVudS1pdGVtIGltZ3tcXHJcXG4gIGhlaWdodCA6IDkwcHg7XFxyXFxufVxcclxcbi5tZW51LWl0ZW0gLml0ZW0tbmFtZXtcXHJcXG4gIGZvbnQtc2l6ZSA6IDE0cHg7XFxyXFxufVxcclxcbi5sb2dvLXdyYXBwZXIgaW1ne1xcclxcbiAgbWFyZ2luOiA1cHg7XFxyXFxuICAgIGRpc3BsYXk6IGlubGluZTtcXHJcXG4gICAgaGVpZ2h0OiAxMDBweDtcXHJcXG59XFxyXFxuLmxvZ28td3JhcHBlcntcXHJcXG4gIHBvc2l0aW9uIDogc3RhdGljO1xcclxcbiAgdGV4dC1hbGlnbiA6IGNlbnRlcjtcXHJcXG4gIGRpc3BsYXkgOiBibG9jaztcXHJcXG59XFxyXFxuLmxvZ28td3JhcHBlciBzcGFue1xcclxcbiAgcG9zaXRpb246IHN0YXRpYztcXHJcXG59XFxyXFxuLm5hdi13cmFwcGVye1xcclxcbiAgZGlzcGxheTogYmxvY2s7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICBwb3NpdGlvbjogc3RhdGljO1xcclxcbn1cXHJcXG4uY2FydC1ub25lbXB0eSBoMXtcXHJcXG4gIGZvbnQtc2l6ZTogMTZweDtcXHJcXG59XFxyXFxuLm5vdC1sb2dnZWQtaW4tbXNne1xcclxcbiAgZm9udC1zaXplOiAxNHB4O1xcclxcbiAgcGFkZGluZzogMDtcXHJcXG59XFxyXFxuLnRvdGFse1xcclxcbiAgZm9udC1zaXplOiAxNHB4O1xcclxcbn1cXHJcXG5cXHJcXG4ucGl6emEtbmFtZSwgLnBpenphLXNpemUsIC5waXp6YS1udW1iZXIsIC5waXp6YS1wcmljZXtcXHJcXG4gIGZvbnQtc2l6ZTogMTRweDtcXHJcXG59XFxyXFxuLmNhcnQtbm9uZW1wdHl7XFxyXFxuICBtaW4taGVpZ2h0IDogMDtcXHJcXG59XFxyXFxuLnNpZ24taW4tbXNne1xcclxcbiAgZm9udC1zaXplIDogMTZweDtcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ2luLWNvbnRhaW5lciBpbnB1dCwgLnJlZ2lzdGVyLWNvbnRhaW5lciBpbnB1dHtcXHJcXG4gIHBhZGRpbmc6IDVweDtcXHJcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcclxcbiAgICBtYXJnaW46IDIwcHggYXV0bztcXHJcXG59XFxyXFxuLmxvZ2luLWJ1dHRvbntcXHJcXG4gIGZvbnQtc2l6ZSA6IDE0cHg7XFxyXFxufVxcclxcbi5hZGRyZXNzIGlucHV0e1xcclxcbiAgd2lkdGggOiA4MCU7XFxyXFxufVxcclxcbi5hZGRyZXNzIGJ1dHRvbntcXHJcXG4gIGZvbnQtc2l6ZTogMTNweDtcXHJcXG59XFxyXFxuLmxvZ2dlZC1pbi1uYW1le1xcclxcbiAgZm9udC1zaXplOiAxM3B4O1xcclxcbiAgdG9wOiA1JTtcXHJcXG59XFxyXFxuLmNhcnQtZW1wdHkgcHtcXHJcXG4gIGZvbnQtc2l6ZSA6IDE0cHg7XFxyXFxufVxcclxcbi5jYXJ0LWVtcHR5IGgxe1xcclxcbiAgZm9udC1zaXplOiAyMHB4O1xcclxcbn1cXHJcXG4uY2FydC1lbXB0eSBhe1xcclxcbiAgZm9udC1zaXplOiAxM3B4O1xcclxcbn1cXHJcXG4uZm9yZ290LXB3e1xcclxcbiAgZm9udC1zaXplOiAxNXB4O1xcclxcbn1cXHJcXG4udG90YWwtY291bnRlcntcXHJcXG4gIHBhZGRpbmcgOiAycHg7XFxyXFxufVxcclxcbi5uYXYtd3JhcHBlciB1bCBsaXtcXHJcXG4gIHBhZGRpbmcgOiAxcHg7XFxyXFxufVxcclxcbn1cXHJcXG5cIixcIi5ub3R5X3RoZW1lX19taW50Lm5vdHlfYmFyIHtcXHJcXG4gIG1hcmdpbjogNHB4IDA7XFxyXFxuICBvdmVyZmxvdzogaGlkZGVuO1xcclxcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xcclxcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcblxcclxcbiAgLm5vdHlfYm9keSB7XFxyXFxuXFx0cGFkZGluZzogMTBweDtcXHJcXG5cXHRmb250LXNpemU6IDE0cHg7XFxyXFxuICB9XFxyXFxuXFxyXFxuICAubm90eV9idXR0b25zIHtcXHJcXG5cXHRwYWRkaW5nOiAxMHB4O1xcclxcbiAgfVxcclxcbn1cXHJcXG5cXHJcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2FsZXJ0LFxcclxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fbm90aWZpY2F0aW9uIHtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxyXFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0QxRDFEMTtcXHJcXG4gIGNvbG9yOiAjMkYyRjJGO1xcclxcbn1cXHJcXG5cXHJcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX3dhcm5pbmcge1xcclxcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGQUU0MjtcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjRTg5RjNDO1xcclxcbiAgY29sb3I6ICNmZmY7XFxyXFxufVxcclxcblxcclxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fZXJyb3Ige1xcclxcbiAgYmFja2dyb3VuZC1jb2xvcjogI0RFNjM2RjtcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjQ0E1QTY1O1xcclxcbiAgY29sb3I6ICNmZmY7XFxyXFxufVxcclxcblxcclxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9faW5mbyxcXHJcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2luZm9ybWF0aW9uIHtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICM3RjdFRkY7XFxyXFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzc0NzNFODtcXHJcXG4gIGNvbG9yOiAjZmZmO1xcclxcbn1cXHJcXG5cXHJcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX3N1Y2Nlc3Mge1xcclxcbiAgYmFja2dyb3VuZC1jb2xvcjogI0FGQzc2NTtcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjQTBCNTVDO1xcclxcbiAgY29sb3I6ICNmZmY7XFxyXFxufVxcclxcblwiLFwiLy8gQ29sb3JzXFxyXFxuJHByaW1hcnk6ICNGRTVGMUU7XFxyXFxuJHByaW1hcnktaG92ZXI6ICNiMjMzMDE7XFxyXFxuJHNlY29uZGFyeTogI2Y4ZjhmODtcXHJcXG4kcHVyZTojZmZmO1xcclxcbiRkYXJrOiMyMzIzMjM7XFxyXFxuJGdyYXk6I2NjYztcXHJcXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgcmV0dXJuIFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChjb250ZW50LCBcIn1cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oJycpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gKG1vZHVsZXMsIG1lZGlhUXVlcnksIGRlZHVwZSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgJyddXTtcbiAgICB9XG5cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItZGVzdHJ1Y3R1cmluZ1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IG1vZHVsZXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19pXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udGludWVcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYVF1ZXJ5KSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMl0gPSBcIlwiLmNvbmNhdChtZWRpYVF1ZXJ5LCBcIiBhbmQgXCIpLmNvbmNhdChpdGVtWzJdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7IHJldHVybiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBfbm9uSXRlcmFibGVSZXN0KCk7IH1cblxuZnVuY3Rpb24gX25vbkl0ZXJhYmxlUmVzdCgpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTsgfVxuXG5mdW5jdGlvbiBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobywgbWluTGVuKSB7IGlmICghbykgcmV0dXJuOyBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7IGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7IGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pOyBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IH1cblxuZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHsgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9XG5cbmZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwidW5kZWZpbmVkXCIgfHwgIShTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpKSByZXR1cm47IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfVxuXG5mdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7IH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pIHtcbiAgdmFyIF9pdGVtID0gX3NsaWNlZFRvQXJyYXkoaXRlbSwgNCksXG4gICAgICBjb250ZW50ID0gX2l0ZW1bMV0sXG4gICAgICBjc3NNYXBwaW5nID0gX2l0ZW1bM107XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICB2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIFwiLyojIHNvdXJjZVVSTD1cIi5jb25jYXQoY3NzTWFwcGluZy5zb3VyY2VSb290IHx8ICcnKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59OyIsImltcG9ydCBhcGkgZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgICAgICAgIGltcG9ydCBjb250ZW50IGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3Njc3Muc2Nzc1wiO1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgaXNPbGRJRSA9IGZ1bmN0aW9uIGlzT2xkSUUoKSB7XG4gIHZhciBtZW1vO1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUoKSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3NcbiAgICAgIC8vIEBzZWUgaHR0cDovL2Jyb3dzZXJoYWNrcy5jb20vI2hhY2stZTcxZDg2OTJmNjUzMzQxNzNmZWU3MTVjMjIyY2I4MDVcbiAgICAgIC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcbiAgICAgIC8vIHRvIG9wZXJhdGUgY29ycmVjdGx5IGludG8gbm9uLXN0YW5kYXJkIGVudmlyb25tZW50c1xuICAgICAgLy8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG4gICAgICBtZW1vID0gQm9vbGVhbih3aW5kb3cgJiYgZG9jdW1lbnQgJiYgZG9jdW1lbnQuYWxsICYmICF3aW5kb3cuYXRvYik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG59KCk7XG5cbnZhciBnZXRUYXJnZXQgPSBmdW5jdGlvbiBnZXRUYXJnZXQoKSB7XG4gIHZhciBtZW1vID0ge307XG4gIHJldHVybiBmdW5jdGlvbiBtZW1vcml6ZSh0YXJnZXQpIHtcbiAgICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTsgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblxuICAgICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbiAgfTtcbn0oKTtcblxudmFyIHN0eWxlc0luRG9tID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5Eb20ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5Eb21baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXVxuICAgIH07XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGVzSW5Eb20ucHVzaCh7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IGFkZFN0eWxlKG9iaiwgb3B0aW9ucyksXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gb3B0aW9ucy5hdHRyaWJ1dGVzIHx8IHt9O1xuXG4gIGlmICh0eXBlb2YgYXR0cmlidXRlcy5ub25jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09ICd1bmRlZmluZWQnID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gICAgaWYgKG5vbmNlKSB7XG4gICAgICBhdHRyaWJ1dGVzLm5vbmNlID0gbm9uY2U7XG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zLmluc2VydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9wdGlvbnMuaW5zZXJ0KHN0eWxlKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KG9wdGlvbnMuaW5zZXJ0IHx8ICdoZWFkJyk7XG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICB9XG5cbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgcmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZS5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG52YXIgcmVwbGFjZVRleHQgPSBmdW5jdGlvbiByZXBsYWNlVGV4dCgpIHtcbiAgdmFyIHRleHRTdG9yZSA9IFtdO1xuICByZXR1cm4gZnVuY3Rpb24gcmVwbGFjZShpbmRleCwgcmVwbGFjZW1lbnQpIHtcbiAgICB0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG4gICAgcmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcoc3R5bGUsIGluZGV4LCByZW1vdmUsIG9iaikge1xuICB2YXIgY3NzID0gcmVtb3ZlID8gJycgOiBvYmoubWVkaWEgPyBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpLmNvbmNhdChvYmouY3NzLCBcIn1cIikgOiBvYmouY3NzOyAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG4gIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuICAgIHZhciBjaGlsZE5vZGVzID0gc3R5bGUuY2hpbGROb2RlcztcblxuICAgIGlmIChjaGlsZE5vZGVzW2luZGV4XSkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgIH1cblxuICAgIGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgc3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGUsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gb2JqLmNzcztcbiAgdmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAobWVkaWEpIHtcbiAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ21lZGlhJywgbWVkaWEpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlLnJlbW92ZUF0dHJpYnV0ZSgnbWVkaWEnKTtcbiAgfVxuXG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZS5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG52YXIgc2luZ2xldG9uID0gbnVsbDtcbnZhciBzaW5nbGV0b25Db3VudGVyID0gMDtcblxuZnVuY3Rpb24gYWRkU3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBzdHlsZTtcbiAgdmFyIHVwZGF0ZTtcbiAgdmFyIHJlbW92ZTtcblxuICBpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcbiAgICB2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcbiAgICBzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIGZhbHNlKTtcbiAgICByZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlID0gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICAgIHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cbiAgICByZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuICAgIH07XG4gIH1cblxuICB1cGRhdGUob2JqKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlKCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9OyAvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cbiAgLy8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXG4gIGlmICghb3B0aW9ucy5zaW5nbGV0b24gJiYgdHlwZW9mIG9wdGlvbnMuc2luZ2xldG9uICE9PSAnYm9vbGVhbicpIHtcbiAgICBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcbiAgfVxuXG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobmV3TGlzdCkgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuXG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuXG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuXG4gICAgICBpZiAoc3R5bGVzSW5Eb21bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRG9tW19pbmRleF0udXBkYXRlcigpO1xuXG4gICAgICAgIHN0eWxlc0luRG9tLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiaW1wb3J0ICcuLy4uLy4uL3Njc3Mvc2Nzcy5zY3NzJztcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcclxuXHJcbmxldCBkaXNtaXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc21pc3NPcmRlckljb24nKTtcclxuZGlzbWlzcy5mb3JFYWNoKGRpc21pc3NJY29uID0+IHtcclxuICBkaXNtaXNzSWNvbi5vbmNsaWNrID0gZGlzbWlzc09yZGVyO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGRpc21pc3NPcmRlcihldmVudCkge1xyXG4gIGxldCBpY29uID0gZXZlbnQuY3VycmVudFRhcmdldDtcclxuICBsZXQgaWQgPSBpY29uLmRhdGFzZXQuaWQ7XHJcbiAgaWNvbi5zdHlsZS5hbmltYXRpb24gPSBcInNoYWtlIDJzIGluZmluaXRlXCI7XHJcbiAgaWNvbi5zdHlsZS5jb2xvciA9IFwieWVsbG93XCI7XHJcbiAgYXhpb3MucG9zdCgnL2NhcnQvZGlzbWlzc29yZGVyJywge2lkfSkudGhlbihyZXMgPT4ge1xyXG4gICAgaWNvbi5zdHlsZS5jb2xvciA9IFwiIzRCQjU0M1wiO1xyXG4gICAgaWNvbi5zdHlsZS5hbmltYXRpb24gPSBcIm5vbmVcIjtcclxuXHJcbiAgICAvL3VwZGF0ZSB0aGUgY2hhbmdlcyBpbiB0b3RhbCBxdWFudGl0eSBhbmQgdG90YWwgcHJpY2VcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbC1jb3VudGVyJykuaW5uZXJUZXh0ID0gcmVzLmRhdGEudG90YWxRdHk7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG90YWwtcHJpY2UnKS5pbm5lclRleHQgPSByZXMuZGF0YS50b3RhbFByaWNlO1xyXG5cclxuICAgIHNsaWRlQW5kRmFkZShpY29uLnBhcmVudEVsZW1lbnQpO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGljb24uc3R5bGUuY29sb3IgPSBcIm9yYW5nZVwiO1xyXG4gICAgfSwgMzAwMCk7XHJcbiAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgaWNvbi5zdHlsZS5jb2xvciA9IFwicmVkXCI7XHJcbiAgICBpY29uLnN0eWxlLmFuaW1hdGlvbiA9IFwibm9uZVwiO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGljb24uc3R5bGUuY29sb3IgPSBcIm9yYW5nZVwiO1xyXG4gICAgfSwgMzAwMCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNsaWRlQW5kRmFkZShlbGVtKSB7XHJcbiAgZWxlbS5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZVgoMzAwcHgpXCI7XHJcbiAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gXCIwXCI7XHJcbiAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICBlbGVtLnJlbW92ZSgpO1xyXG4gIH0sIDIwMDApO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gbW9kdWxlWydkZWZhdWx0J10gOlxuXHRcdCgpID0+IG1vZHVsZTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGVcbl9fd2VicGFja19yZXF1aXJlX18oXCIuL3Jlc291cmNlcy9qcy9jdXN0b21lci9jYXJ0LmpzXCIpO1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnZXhwb3J0cycgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxuIl0sInNvdXJjZVJvb3QiOiIifQ==