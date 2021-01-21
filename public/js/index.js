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

/***/ "./node_modules/noty/lib/noty.js":
/*!***************************************!*\
  !*** ./node_modules/noty/lib/noty.js ***!
  \***************************************/
/***/ (function(module) {

/* 
  @package NOTY - Dependency-free notification library 
  @version version: 3.2.0-beta 
  @contributors https://github.com/needim/noty/graphs/contributors 
  @documentation Examples and Documentation - https://ned.im/noty 
  @license Licensed under the MIT licenses: http://www.opensource.org/licenses/mit-license.php 
*/

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else {}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __nested_webpack_require_874__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_874__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__nested_webpack_require_874__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__nested_webpack_require_874__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__nested_webpack_require_874__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__nested_webpack_require_874__.d = function(exports, name, getter) {
/******/ 		if(!__nested_webpack_require_874__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__nested_webpack_require_874__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__nested_webpack_require_874__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__nested_webpack_require_874__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__nested_webpack_require_874__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __nested_webpack_require_874__(__nested_webpack_require_874__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __nested_webpack_require_3313__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.css = exports.deepExtend = exports.animationEndEvents = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.inArray = inArray;
exports.stopPropagation = stopPropagation;
exports.generateID = generateID;
exports.outerHeight = outerHeight;
exports.addListener = addListener;
exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.remove = remove;
exports.classList = classList;
exports.visibilityChangeFlow = visibilityChangeFlow;
exports.createAudioElements = createAudioElements;

var _api = __nested_webpack_require_3313__(1);

var API = _interopRequireWildcard(_api);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var animationEndEvents = exports.animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

function inArray(needle, haystack, argStrict) {
  var key = void 0;
  var strict = !!argStrict;

  if (strict) {
    for (key in haystack) {
      if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
        return true;
      }
    }
  } else {
    for (key in haystack) {
      if (haystack.hasOwnProperty(key) && haystack[key] === needle) {
        return true;
      }
    }
  }
  return false;
}

function stopPropagation(evt) {
  evt = evt || window.event;

  if (typeof evt.stopPropagation !== 'undefined') {
    evt.stopPropagation();
  } else {
    evt.cancelBubble = true;
  }
}

var deepExtend = exports.deepExtend = function deepExtend(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj) continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          out[key] = obj[key];
        } else if (_typeof(obj[key]) === 'object' && obj[key] !== null) {
          out[key] = deepExtend(out[key], obj[key]);
        } else {
          out[key] = obj[key];
        }
      }
    }
  }

  return out;
};

function generateID() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var id = 'noty_' + prefix + '_';

  id += 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });

  return id;
}

function outerHeight(el) {
  var height = el.offsetHeight;
  var style = window.getComputedStyle(el);

  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
  return height;
}

var css = exports.css = function () {
  var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
  var cssProps = {};

  function camelCase(string) {
    return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
      return letter.toUpperCase();
    });
  }

  function getVendorProp(name) {
    var style = document.body.style;
    if (name in style) return name;

    var i = cssPrefixes.length;
    var capName = name.charAt(0).toUpperCase() + name.slice(1);
    var vendorName = void 0;

    while (i--) {
      vendorName = cssPrefixes[i] + capName;
      if (vendorName in style) return vendorName;
    }

    return name;
  }

  function getStyleProp(name) {
    name = camelCase(name);
    return cssProps[name] || (cssProps[name] = getVendorProp(name));
  }

  function applyCss(element, prop, value) {
    prop = getStyleProp(prop);
    element.style[prop] = value;
  }

  return function (element, properties) {
    var args = arguments;
    var prop = void 0;
    var value = void 0;

    if (args.length === 2) {
      for (prop in properties) {
        if (properties.hasOwnProperty(prop)) {
          value = properties[prop];
          if (value !== undefined && properties.hasOwnProperty(prop)) {
            applyCss(element, prop, value);
          }
        }
      }
    } else {
      applyCss(element, args[1], args[2]);
    }
  };
}();

function addListener(el, events, cb) {
  var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  events = events.split(' ');
  for (var i = 0; i < events.length; i++) {
    if (document.addEventListener) {
      el.addEventListener(events[i], cb, useCapture);
    } else if (document.attachEvent) {
      el.attachEvent('on' + events[i], cb);
    }
  }
}

function hasClass(element, name) {
  var list = typeof element === 'string' ? element : classList(element);
  return list.indexOf(' ' + name + ' ') >= 0;
}

function addClass(element, name) {
  var oldList = classList(element);
  var newList = oldList + name;

  if (hasClass(oldList, name)) return;

  // Trim the opening space.
  element.className = newList.substring(1);
}

function removeClass(element, name) {
  var oldList = classList(element);
  var newList = void 0;

  if (!hasClass(element, name)) return;

  // Replace the class name.
  newList = oldList.replace(' ' + name + ' ', ' ');

  // Trim the opening and closing spaces.
  element.className = newList.substring(1, newList.length - 1);
}

function remove(element) {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function classList(element) {
  return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
}

function visibilityChangeFlow() {
  var hidden = void 0;
  var visibilityChange = void 0;
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }

  function onVisibilityChange() {
    API.PageHidden = document[hidden];
    handleVisibilityChange();
  }

  function onBlur() {
    API.PageHidden = true;
    handleVisibilityChange();
  }

  function onFocus() {
    API.PageHidden = false;
    handleVisibilityChange();
  }

  function handleVisibilityChange() {
    if (API.PageHidden) stopAll();else resumeAll();
  }

  function stopAll() {
    setTimeout(function () {
      Object.keys(API.Store).forEach(function (id) {
        if (API.Store.hasOwnProperty(id)) {
          if (API.Store[id].options.visibilityControl) {
            API.Store[id].stop();
          }
        }
      });
    }, 100);
  }

  function resumeAll() {
    setTimeout(function () {
      Object.keys(API.Store).forEach(function (id) {
        if (API.Store.hasOwnProperty(id)) {
          if (API.Store[id].options.visibilityControl) {
            API.Store[id].resume();
          }
        }
      });
      API.queueRenderAll();
    }, 100);
  }

  if (visibilityChange) {
    addListener(document, visibilityChange, onVisibilityChange);
  }

  addListener(window, 'blur', onBlur);
  addListener(window, 'focus', onFocus);
}

function createAudioElements(ref) {
  if (ref.hasSound) {
    var audioElement = document.createElement('audio');

    ref.options.sounds.sources.forEach(function (s) {
      var source = document.createElement('source');
      source.src = s;
      source.type = 'audio/' + getExtension(s);
      audioElement.appendChild(source);
    });

    if (ref.barDom) {
      ref.barDom.appendChild(audioElement);
    } else {
      document.querySelector('body').appendChild(audioElement);
    }

    audioElement.volume = ref.options.sounds.volume;

    if (!ref.soundPlayed) {
      audioElement.play();
      ref.soundPlayed = true;
    }

    audioElement.onended = function () {
      remove(audioElement);
    };
  }
}

function getExtension(fileName) {
  return fileName.match(/\.([^.]+)$/)[1];
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __nested_webpack_require_11619__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Defaults = exports.Store = exports.Queues = exports.DefaultMaxVisible = exports.docTitle = exports.DocModalCount = exports.PageHidden = undefined;
exports.getQueueCounts = getQueueCounts;
exports.addToQueue = addToQueue;
exports.removeFromQueue = removeFromQueue;
exports.queueRender = queueRender;
exports.queueRenderAll = queueRenderAll;
exports.ghostFix = ghostFix;
exports.build = build;
exports.hasButtons = hasButtons;
exports.handleModal = handleModal;
exports.handleModalClose = handleModalClose;
exports.queueClose = queueClose;
exports.dequeueClose = dequeueClose;
exports.fire = fire;
exports.openFlow = openFlow;
exports.closeFlow = closeFlow;

var _utils = __nested_webpack_require_11619__(0);

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var PageHidden = exports.PageHidden = false;
var DocModalCount = exports.DocModalCount = 0;

var DocTitleProps = {
  originalTitle: null,
  count: 0,
  changed: false,
  timer: -1
};

var docTitle = exports.docTitle = {
  increment: function increment() {
    DocTitleProps.count++;

    docTitle._update();
  },

  decrement: function decrement() {
    DocTitleProps.count--;

    if (DocTitleProps.count <= 0) {
      docTitle._clear();
      return;
    }

    docTitle._update();
  },

  _update: function _update() {
    var title = document.title;

    if (!DocTitleProps.changed) {
      DocTitleProps.originalTitle = title;
      document.title = '(' + DocTitleProps.count + ') ' + title;
      DocTitleProps.changed = true;
    } else {
      document.title = '(' + DocTitleProps.count + ') ' + DocTitleProps.originalTitle;
    }
  },

  _clear: function _clear() {
    if (DocTitleProps.changed) {
      DocTitleProps.count = 0;
      document.title = DocTitleProps.originalTitle;
      DocTitleProps.changed = false;
    }
  }
};

var DefaultMaxVisible = exports.DefaultMaxVisible = 5;

var Queues = exports.Queues = {
  global: {
    maxVisible: DefaultMaxVisible,
    queue: []
  }
};

var Store = exports.Store = {};

var Defaults = exports.Defaults = {
  type: 'alert',
  layout: 'topRight',
  theme: 'mint',
  text: '',
  timeout: false,
  progressBar: true,
  closeWith: ['click'],
  animation: {
    open: 'noty_effects_open',
    close: 'noty_effects_close'
  },
  id: false,
  force: false,
  killer: false,
  queue: 'global',
  container: false,
  buttons: [],
  callbacks: {
    beforeShow: null,
    onShow: null,
    afterShow: null,
    onClose: null,
    afterClose: null,
    onClick: null,
    onHover: null,
    onTemplate: null
  },
  sounds: {
    sources: [],
    volume: 1,
    conditions: []
  },
  titleCount: {
    conditions: []
  },
  modal: false,
  visibilityControl: false

  /**
   * @param {string} queueName
   * @return {object}
   */
};function getQueueCounts() {
  var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

  var count = 0;
  var max = DefaultMaxVisible;

  if (Queues.hasOwnProperty(queueName)) {
    max = Queues[queueName].maxVisible;
    Object.keys(Store).forEach(function (i) {
      if (Store[i].options.queue === queueName && !Store[i].closed) count++;
    });
  }

  return {
    current: count,
    maxVisible: max
  };
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function addToQueue(ref) {
  if (!Queues.hasOwnProperty(ref.options.queue)) {
    Queues[ref.options.queue] = { maxVisible: DefaultMaxVisible, queue: [] };
  }

  Queues[ref.options.queue].queue.push(ref);
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function removeFromQueue(ref) {
  if (Queues.hasOwnProperty(ref.options.queue)) {
    var queue = [];
    Object.keys(Queues[ref.options.queue].queue).forEach(function (i) {
      if (Queues[ref.options.queue].queue[i].id !== ref.id) {
        queue.push(Queues[ref.options.queue].queue[i]);
      }
    });
    Queues[ref.options.queue].queue = queue;
  }
}

/**
 * @param {string} queueName
 * @return {void}
 */
function queueRender() {
  var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

  if (Queues.hasOwnProperty(queueName)) {
    var noty = Queues[queueName].queue.shift();

    if (noty) noty.show();
  }
}

/**
 * @return {void}
 */
function queueRenderAll() {
  Object.keys(Queues).forEach(function (queueName) {
    queueRender(queueName);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function ghostFix(ref) {
  var ghostID = Utils.generateID('ghost');
  var ghost = document.createElement('div');
  ghost.setAttribute('id', ghostID);
  Utils.css(ghost, {
    height: Utils.outerHeight(ref.barDom) + 'px'
  });

  ref.barDom.insertAdjacentHTML('afterend', ghost.outerHTML);

  Utils.remove(ref.barDom);
  ghost = document.getElementById(ghostID);
  Utils.addClass(ghost, 'noty_fix_effects_height');
  Utils.addListener(ghost, Utils.animationEndEvents, function () {
    Utils.remove(ghost);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function build(ref) {
  findOrCreateContainer(ref);

  var markup = '<div class="noty_body">' + ref.options.text + '</div>' + buildButtons(ref) + '<div class="noty_progressbar"></div>';

  ref.barDom = document.createElement('div');
  ref.barDom.setAttribute('id', ref.id);
  Utils.addClass(ref.barDom, 'noty_bar noty_type__' + ref.options.type + ' noty_theme__' + ref.options.theme);

  ref.barDom.innerHTML = markup;

  fire(ref, 'onTemplate');
}

/**
 * @param {Noty} ref
 * @return {boolean}
 */
function hasButtons(ref) {
  return !!(ref.options.buttons && Object.keys(ref.options.buttons).length);
}

/**
 * @param {Noty} ref
 * @return {string}
 */
function buildButtons(ref) {
  if (hasButtons(ref)) {
    var buttons = document.createElement('div');
    Utils.addClass(buttons, 'noty_buttons');

    Object.keys(ref.options.buttons).forEach(function (key) {
      buttons.appendChild(ref.options.buttons[key].dom);
    });

    ref.options.buttons.forEach(function (btn) {
      buttons.appendChild(btn.dom);
    });
    return buttons.outerHTML;
  }
  return '';
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function handleModal(ref) {
  if (ref.options.modal) {
    if (DocModalCount === 0) {
      createModal(ref);
    }

    exports.DocModalCount = DocModalCount += 1;
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function handleModalClose(ref) {
  if (ref.options.modal && DocModalCount > 0) {
    exports.DocModalCount = DocModalCount -= 1;

    if (DocModalCount <= 0) {
      var modal = document.querySelector('.noty_modal');

      if (modal) {
        Utils.removeClass(modal, 'noty_modal_open');
        Utils.addClass(modal, 'noty_modal_close');
        Utils.addListener(modal, Utils.animationEndEvents, function () {
          Utils.remove(modal);
        });
      }
    }
  }
}

/**
 * @return {void}
 */
function createModal() {
  var body = document.querySelector('body');
  var modal = document.createElement('div');
  Utils.addClass(modal, 'noty_modal');
  body.insertBefore(modal, body.firstChild);
  Utils.addClass(modal, 'noty_modal_open');

  Utils.addListener(modal, Utils.animationEndEvents, function () {
    Utils.removeClass(modal, 'noty_modal_open');
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function findOrCreateContainer(ref) {
  if (ref.options.container) {
    ref.layoutDom = document.querySelector(ref.options.container);
    return;
  }

  var layoutID = 'noty_layout__' + ref.options.layout;
  ref.layoutDom = document.querySelector('div#' + layoutID);

  if (!ref.layoutDom) {
    ref.layoutDom = document.createElement('div');
    ref.layoutDom.setAttribute('id', layoutID);
    ref.layoutDom.setAttribute('role', 'alert');
    ref.layoutDom.setAttribute('aria-live', 'polite');
    Utils.addClass(ref.layoutDom, 'noty_layout');
    document.querySelector('body').appendChild(ref.layoutDom);
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function queueClose(ref) {
  if (ref.options.timeout) {
    if (ref.options.progressBar && ref.progressDom) {
      Utils.css(ref.progressDom, {
        transition: 'width ' + ref.options.timeout + 'ms linear',
        width: '0%'
      });
    }

    clearTimeout(ref.closeTimer);

    ref.closeTimer = setTimeout(function () {
      ref.close();
    }, ref.options.timeout);
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function dequeueClose(ref) {
  if (ref.options.timeout && ref.closeTimer) {
    clearTimeout(ref.closeTimer);
    ref.closeTimer = -1;

    if (ref.options.progressBar && ref.progressDom) {
      Utils.css(ref.progressDom, {
        transition: 'width 0ms linear',
        width: '100%'
      });
    }
  }
}

/**
 * @param {Noty} ref
 * @param {string} eventName
 * @return {void}
 */
function fire(ref, eventName) {
  if (ref.listeners.hasOwnProperty(eventName)) {
    ref.listeners[eventName].forEach(function (cb) {
      if (typeof cb === 'function') {
        cb.apply(ref);
      }
    });
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function openFlow(ref) {
  fire(ref, 'afterShow');
  queueClose(ref);

  Utils.addListener(ref.barDom, 'mouseenter', function () {
    dequeueClose(ref);
  });

  Utils.addListener(ref.barDom, 'mouseleave', function () {
    queueClose(ref);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function closeFlow(ref) {
  delete Store[ref.id];
  ref.closing = false;
  fire(ref, 'afterClose');

  Utils.remove(ref.barDom);

  if (ref.layoutDom.querySelectorAll('.noty_bar').length === 0 && !ref.options.container) {
    Utils.remove(ref.layoutDom);
  }

  if (Utils.inArray('docVisible', ref.options.titleCount.conditions) || Utils.inArray('docHidden', ref.options.titleCount.conditions)) {
    docTitle.decrement();
  }

  queueRender(ref.options.queue);
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __nested_webpack_require_21770__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotyButton = undefined;

var _utils = __nested_webpack_require_21770__(0);

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NotyButton = exports.NotyButton = function NotyButton(html, classes, cb) {
  var _this = this;

  var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  _classCallCheck(this, NotyButton);

  this.dom = document.createElement('button');
  this.dom.innerHTML = html;
  this.id = attributes.id = attributes.id || Utils.generateID('button');
  this.cb = cb;
  Object.keys(attributes).forEach(function (propertyName) {
    _this.dom.setAttribute(propertyName, attributes[propertyName]);
  });
  Utils.addClass(this.dom, classes || 'noty_btn');

  return this;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __nested_webpack_require_23069__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Push = exports.Push = function () {
  function Push() {
    var workerPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/service-worker.js';

    _classCallCheck(this, Push);

    this.subData = {};
    this.workerPath = workerPath;
    this.listeners = {
      onPermissionGranted: [],
      onPermissionDenied: [],
      onSubscriptionSuccess: [],
      onSubscriptionCancel: [],
      onWorkerError: [],
      onWorkerSuccess: [],
      onWorkerNotSupported: []
    };
    return this;
  }

  /**
   * @param {string} eventName
   * @param {function} cb
   * @return {Push}
   */


  _createClass(Push, [{
    key: 'on',
    value: function on(eventName) {
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
        this.listeners[eventName].push(cb);
      }

      return this;
    }
  }, {
    key: 'fire',
    value: function fire(eventName) {
      var _this = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (this.listeners.hasOwnProperty(eventName)) {
        this.listeners[eventName].forEach(function (cb) {
          if (typeof cb === 'function') {
            cb.apply(_this, params);
          }
        });
      }
    }
  }, {
    key: 'create',
    value: function create() {
      console.log('NOT IMPLEMENTED YET');
    }

    /**
     * @return {boolean}
     */

  }, {
    key: 'isSupported',
    value: function isSupported() {
      var result = false;

      try {
        result = window.Notification || window.webkitNotifications || navigator.mozNotification || window.external && window.external.msIsSiteMode() !== undefined;
      } catch (e) {}

      return result;
    }

    /**
     * @return {string}
     */

  }, {
    key: 'getPermissionStatus',
    value: function getPermissionStatus() {
      var perm = 'default';

      if (window.Notification && window.Notification.permissionLevel) {
        perm = window.Notification.permissionLevel;
      } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
        switch (window.webkitNotifications.checkPermission()) {
          case 1:
            perm = 'default';
            break;
          case 0:
            perm = 'granted';
            break;
          default:
            perm = 'denied';
        }
      } else if (window.Notification && window.Notification.permission) {
        perm = window.Notification.permission;
      } else if (navigator.mozNotification) {
        perm = 'granted';
      } else if (window.external && window.external.msIsSiteMode() !== undefined) {
        perm = window.external.msIsSiteMode() ? 'granted' : 'default';
      }

      return perm.toString().toLowerCase();
    }

    /**
     * @return {string}
     */

  }, {
    key: 'getEndpoint',
    value: function getEndpoint(subscription) {
      var endpoint = subscription.endpoint;
      var subscriptionId = subscription.subscriptionId;

      // fix for Chrome < 45
      if (subscriptionId && endpoint.indexOf(subscriptionId) === -1) {
        endpoint += '/' + subscriptionId;
      }

      return endpoint;
    }

    /**
     * @return {boolean}
     */

  }, {
    key: 'isSWRegistered',
    value: function isSWRegistered() {
      try {
        return navigator.serviceWorker.controller.state === 'activated';
      } catch (e) {
        return false;
      }
    }

    /**
     * @return {void}
     */

  }, {
    key: 'unregisterWorker',
    value: function unregisterWorker() {
      var self = this;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = registrations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var registration = _step.value;

              registration.unregister();
              self.fire('onSubscriptionCancel');
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        });
      }
    }

    /**
     * @return {void}
     */

  }, {
    key: 'requestSubscription',
    value: function requestSubscription() {
      var _this2 = this;

      var userVisibleOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var self = this;
      var current = this.getPermissionStatus();
      var cb = function cb(result) {
        if (result === 'granted') {
          _this2.fire('onPermissionGranted');

          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(_this2.workerPath).then(function () {
              navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                self.fire('onWorkerSuccess');
                serviceWorkerRegistration.pushManager.subscribe({
                  userVisibleOnly: userVisibleOnly
                }).then(function (subscription) {
                  var key = subscription.getKey('p256dh');
                  var token = subscription.getKey('auth');

                  self.subData = {
                    endpoint: self.getEndpoint(subscription),
                    p256dh: key ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                    auth: token ? window.btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null
                  };

                  self.fire('onSubscriptionSuccess', [self.subData]);
                }).catch(function (err) {
                  self.fire('onWorkerError', [err]);
                });
              });
            });
          } else {
            self.fire('onWorkerNotSupported');
          }
        } else if (result === 'denied') {
          _this2.fire('onPermissionDenied');
          _this2.unregisterWorker();
        }
      };

      if (current === 'default') {
        if (window.Notification && window.Notification.requestPermission) {
          window.Notification.requestPermission(cb);
        } else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
          window.webkitNotifications.requestPermission(cb);
        }
      } else {
        cb(current);
      }
    }
  }]);

  return Push;
}();

/***/ }),
/* 4 */
/***/ (function(module, exports, __nested_webpack_require_30823__) {

/* WEBPACK VAR INJECTION */(function(process, global) {var require;/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.1.1
 */

(function (global, factory) {
	  true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var r = require;
    var vertx = __nested_webpack_require_30823__(9);
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === GET_THEN_ERROR) {
      reject(promise, GET_THEN_ERROR.error);
      GET_THEN_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;

  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = undefined,
      callback = undefined,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function Enumerator$1(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate(input);
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

Enumerator$1.prototype._enumerate = function (input) {
  for (var i = 0; this._state === PENDING && i < input.length; i++) {
    this._eachEntry(input[i], i);
  }
};

Enumerator$1.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$1 = c.resolve;

  if (resolve$$1 === resolve$1) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise$2) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$1) {
        return resolve$$1(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$1(entry), i);
  }
};

Enumerator$1.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator$1.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all$1(entries) {
  return new Enumerator$1(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race$1(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise$2(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise$2 ? initializePromise(this, resolver) : needsNew();
  }
}

Promise$2.all = all$1;
Promise$2.race = race$1;
Promise$2.resolve = resolve$1;
Promise$2.reject = reject$1;
Promise$2._setScheduler = setScheduler;
Promise$2._setAsap = setAsap;
Promise$2._asap = asap;

Promise$2.prototype = {
  constructor: Promise$2,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    let author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: then,

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

/*global self*/
function polyfill$1() {
    var local = undefined;

    if (typeof global !== 'undefined') {
        local = global;
    } else if (typeof self !== 'undefined') {
        local = self;
    } else {
        try {
            local = Function('return this')();
        } catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }

    var P = local.Promise;

    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
            // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }

    local.Promise = Promise$2;
}

// Strange compat..
Promise$2.polyfill = polyfill$1;
Promise$2.Promise = Promise$2;

return Promise$2;

})));

//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(exports, __nested_webpack_require_30823__(7), __nested_webpack_require_30823__(8)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 6 */
/***/ (function(module, exports, __nested_webpack_require_59670__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global VERSION */

__nested_webpack_require_59670__(5);

var _es6Promise = __nested_webpack_require_59670__(4);

var _es6Promise2 = _interopRequireDefault(_es6Promise);

var _utils = __nested_webpack_require_59670__(0);

var Utils = _interopRequireWildcard(_utils);

var _api = __nested_webpack_require_59670__(1);

var API = _interopRequireWildcard(_api);

var _button = __nested_webpack_require_59670__(2);

var _push = __nested_webpack_require_59670__(3);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Noty = function () {
  /**
   * @param {object} options
   * @return {Noty}
   */
  function Noty() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Noty);

    this.options = Utils.deepExtend({}, API.Defaults, options);

    if (API.Store[this.options.id]) {
      return API.Store[this.options.id];
    }

    this.id = this.options.id || Utils.generateID('bar');
    this.closeTimer = -1;
    this.barDom = null;
    this.layoutDom = null;
    this.progressDom = null;
    this.showing = false;
    this.shown = false;
    this.closed = false;
    this.closing = false;
    this.killable = this.options.timeout || this.options.closeWith.length > 0;
    this.hasSound = this.options.sounds.sources.length > 0;
    this.soundPlayed = false;
    this.listeners = {
      beforeShow: [],
      onShow: [],
      afterShow: [],
      onClose: [],
      afterClose: [],
      onClick: [],
      onHover: [],
      onTemplate: []
    };
    this.promises = {
      show: null,
      close: null
    };
    this.on('beforeShow', this.options.callbacks.beforeShow);
    this.on('onShow', this.options.callbacks.onShow);
    this.on('afterShow', this.options.callbacks.afterShow);
    this.on('onClose', this.options.callbacks.onClose);
    this.on('afterClose', this.options.callbacks.afterClose);
    this.on('onClick', this.options.callbacks.onClick);
    this.on('onHover', this.options.callbacks.onHover);
    this.on('onTemplate', this.options.callbacks.onTemplate);

    return this;
  }

  /**
   * @param {string} eventName
   * @param {function} cb
   * @return {Noty}
   */


  _createClass(Noty, [{
    key: 'on',
    value: function on(eventName) {
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      if (typeof cb === 'function' && this.listeners.hasOwnProperty(eventName)) {
        this.listeners[eventName].push(cb);
      }

      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'show',
    value: function show() {
      var _this = this;

      if (this.showing || this.shown) {
        return this; // preventing multiple show
      }

      if (this.options.killer === true) {
        Noty.closeAll();
      } else if (typeof this.options.killer === 'string') {
        Noty.closeAll(this.options.killer);
      }

      var queueCounts = API.getQueueCounts(this.options.queue);

      if (queueCounts.current >= queueCounts.maxVisible || API.PageHidden && this.options.visibilityControl) {
        API.addToQueue(this);

        if (API.PageHidden && this.hasSound && Utils.inArray('docHidden', this.options.sounds.conditions)) {
          Utils.createAudioElements(this);
        }

        if (API.PageHidden && Utils.inArray('docHidden', this.options.titleCount.conditions)) {
          API.docTitle.increment();
        }

        return this;
      }

      API.Store[this.id] = this;

      API.fire(this, 'beforeShow');

      this.showing = true;

      if (this.closing) {
        this.showing = false;
        return this;
      }

      API.build(this);
      API.handleModal(this);

      if (this.options.force) {
        this.layoutDom.insertBefore(this.barDom, this.layoutDom.firstChild);
      } else {
        this.layoutDom.appendChild(this.barDom);
      }

      if (this.hasSound && !this.soundPlayed && Utils.inArray('docVisible', this.options.sounds.conditions)) {
        Utils.createAudioElements(this);
      }

      if (Utils.inArray('docVisible', this.options.titleCount.conditions)) {
        API.docTitle.increment();
      }

      this.shown = true;
      this.closed = false;

      // bind button events if any
      if (API.hasButtons(this)) {
        Object.keys(this.options.buttons).forEach(function (key) {
          var btn = _this.barDom.querySelector('#' + _this.options.buttons[key].id);
          Utils.addListener(btn, 'click', function (e) {
            Utils.stopPropagation(e);
            _this.options.buttons[key].cb(_this);
          });
        });
      }

      this.progressDom = this.barDom.querySelector('.noty_progressbar');

      if (Utils.inArray('click', this.options.closeWith)) {
        Utils.addClass(this.barDom, 'noty_close_with_click');
        Utils.addListener(this.barDom, 'click', function (e) {
          Utils.stopPropagation(e);
          API.fire(_this, 'onClick');
          _this.close();
        }, false);
      }

      Utils.addListener(this.barDom, 'mouseenter', function () {
        API.fire(_this, 'onHover');
      }, false);

      if (this.options.timeout) Utils.addClass(this.barDom, 'noty_has_timeout');
      if (this.options.progressBar) {
        Utils.addClass(this.barDom, 'noty_has_progressbar');
      }

      if (Utils.inArray('button', this.options.closeWith)) {
        Utils.addClass(this.barDom, 'noty_close_with_button');

        var closeButton = document.createElement('div');
        Utils.addClass(closeButton, 'noty_close_button');
        closeButton.innerHTML = '×';
        this.barDom.appendChild(closeButton);

        Utils.addListener(closeButton, 'click', function (e) {
          Utils.stopPropagation(e);
          _this.close();
        }, false);
      }

      API.fire(this, 'onShow');

      if (this.options.animation.open === null) {
        this.promises.show = new _es6Promise2.default(function (resolve) {
          resolve();
        });
      } else if (typeof this.options.animation.open === 'function') {
        this.promises.show = new _es6Promise2.default(this.options.animation.open.bind(this));
      } else {
        Utils.addClass(this.barDom, this.options.animation.open);
        this.promises.show = new _es6Promise2.default(function (resolve) {
          Utils.addListener(_this.barDom, Utils.animationEndEvents, function () {
            Utils.removeClass(_this.barDom, _this.options.animation.open);
            resolve();
          });
        });
      }

      this.promises.show.then(function () {
        var _t = _this;
        setTimeout(function () {
          API.openFlow(_t);
        }, 100);
      });

      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'stop',
    value: function stop() {
      API.dequeueClose(this);
      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'resume',
    value: function resume() {
      API.queueClose(this);
      return this;
    }

    /**
     * @param {int|boolean} ms
     * @return {Noty}
     */

  }, {
    key: 'setTimeout',
    value: function (_setTimeout) {
      function setTimeout(_x) {
        return _setTimeout.apply(this, arguments);
      }

      setTimeout.toString = function () {
        return _setTimeout.toString();
      };

      return setTimeout;
    }(function (ms) {
      this.stop();
      this.options.timeout = ms;

      if (this.barDom) {
        if (this.options.timeout) {
          Utils.addClass(this.barDom, 'noty_has_timeout');
        } else {
          Utils.removeClass(this.barDom, 'noty_has_timeout');
        }

        var _t = this;
        setTimeout(function () {
          // ugly fix for progressbar display bug
          _t.resume();
        }, 100);
      }

      return this;
    })

    /**
     * @param {string} html
     * @param {boolean} optionsOverride
     * @return {Noty}
     */

  }, {
    key: 'setText',
    value: function setText(html) {
      var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.barDom) {
        this.barDom.querySelector('.noty_body').innerHTML = html;
      }

      if (optionsOverride) this.options.text = html;

      return this;
    }

    /**
     * @param {string} type
     * @param {boolean} optionsOverride
     * @return {Noty}
     */

  }, {
    key: 'setType',
    value: function setType(type) {
      var _this2 = this;

      var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.barDom) {
        var classList = Utils.classList(this.barDom).split(' ');

        classList.forEach(function (c) {
          if (c.substring(0, 11) === 'noty_type__') {
            Utils.removeClass(_this2.barDom, c);
          }
        });

        Utils.addClass(this.barDom, 'noty_type__' + type);
      }

      if (optionsOverride) this.options.type = type;

      return this;
    }

    /**
     * @param {string} theme
     * @param {boolean} optionsOverride
     * @return {Noty}
     */

  }, {
    key: 'setTheme',
    value: function setTheme(theme) {
      var _this3 = this;

      var optionsOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.barDom) {
        var classList = Utils.classList(this.barDom).split(' ');

        classList.forEach(function (c) {
          if (c.substring(0, 12) === 'noty_theme__') {
            Utils.removeClass(_this3.barDom, c);
          }
        });

        Utils.addClass(this.barDom, 'noty_theme__' + theme);
      }

      if (optionsOverride) this.options.theme = theme;

      return this;
    }

    /**
     * @return {Noty}
     */

  }, {
    key: 'close',
    value: function close() {
      var _this4 = this;

      if (this.closed) return this;

      if (!this.shown) {
        // it's in the queue
        API.removeFromQueue(this);
        return this;
      }

      API.fire(this, 'onClose');

      this.closing = true;

      if (this.options.animation.close === null || this.options.animation.close === false) {
        this.promises.close = new _es6Promise2.default(function (resolve) {
          resolve();
        });
      } else if (typeof this.options.animation.close === 'function') {
        this.promises.close = new _es6Promise2.default(this.options.animation.close.bind(this));
      } else {
        Utils.addClass(this.barDom, this.options.animation.close);
        this.promises.close = new _es6Promise2.default(function (resolve) {
          Utils.addListener(_this4.barDom, Utils.animationEndEvents, function () {
            if (_this4.options.force) {
              Utils.remove(_this4.barDom);
            } else {
              API.ghostFix(_this4);
            }
            resolve();
          });
        });
      }

      this.promises.close.then(function () {
        API.closeFlow(_this4);
        API.handleModalClose(_this4);
      });

      this.closed = true;

      return this;
    }

    // API functions

    /**
     * @param {boolean|string} queueName
     * @return {Noty}
     */

  }], [{
    key: 'closeAll',
    value: function closeAll() {
      var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      Object.keys(API.Store).forEach(function (id) {
        if (queueName) {
          if (API.Store[id].options.queue === queueName && API.Store[id].killable) {
            API.Store[id].close();
          }
        } else if (API.Store[id].killable) {
          API.Store[id].close();
        }
      });
      return this;
    }

    /**
     * @param {string} queueName
     * @return {Noty}
     */

  }, {
    key: 'clearQueue',
    value: function clearQueue() {
      var queueName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'global';

      if (API.Queues.hasOwnProperty(queueName)) {
        API.Queues[queueName].queue = [];
      }
      return this;
    }

    /**
     * @return {API.Queues}
     */

  }, {
    key: 'overrideDefaults',


    /**
     * @param {Object} obj
     * @return {Noty}
     */
    value: function overrideDefaults(obj) {
      API.Defaults = Utils.deepExtend({}, API.Defaults, obj);
      return this;
    }

    /**
     * @param {int} amount
     * @param {string} queueName
     * @return {Noty}
     */

  }, {
    key: 'setMaxVisible',
    value: function setMaxVisible() {
      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : API.DefaultMaxVisible;
      var queueName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'global';

      if (!API.Queues.hasOwnProperty(queueName)) {
        API.Queues[queueName] = { maxVisible: amount, queue: [] };
      }

      API.Queues[queueName].maxVisible = amount;
      return this;
    }

    /**
     * @param {string} innerHtml
     * @param {String} classes
     * @param {Function} cb
     * @param {Object} attributes
     * @return {NotyButton}
     */

  }, {
    key: 'button',
    value: function button(innerHtml) {
      var classes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var cb = arguments[2];
      var attributes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      return new _button.NotyButton(innerHtml, classes, cb, attributes);
    }

    /**
     * @return {string}
     */

  }, {
    key: 'version',
    value: function version() {
      return "3.2.0-beta";
    }

    /**
     * @param {String} workerPath
     * @return {Push}
     */

  }, {
    key: 'Push',
    value: function Push(workerPath) {
      return new _push.Push(workerPath);
    }
  }, {
    key: 'Queues',
    get: function get() {
      return API.Queues;
    }

    /**
     * @return {API.PageHidden}
     */

  }, {
    key: 'PageHidden',
    get: function get() {
      return API.PageHidden;
    }
  }]);

  return Noty;
}();

// Document visibility change controller


exports.default = Noty;
if (typeof window !== 'undefined') {
  Utils.visibilityChangeFlow();
}
module.exports = exports['default'];

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })
/******/ ]);
});
//# sourceMappingURL=noty.js.map

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

/***/ "./resources/js/js.js":
/*!****************************!*\
  !*** ./resources/js/js.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var noty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! noty */ "./node_modules/noty/lib/noty.js");
/* harmony import */ var noty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(noty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _scss_scss_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../scss/scss.scss */ "./resources/scss/scss.scss");




let addToCart = document.querySelectorAll('.add-to-cart');
let totalCounter = document.querySelector('.total-counter');
let loginBtn = document.querySelector('.login-button');
let registerFlash = document.querySelector('.register-flash');
let orderAddress = document.querySelector('.order-address');
let orderBtn = document.querySelector('.order-btn');

//what happens when you click on the add button

let pressedBtn;

addToCart.forEach(btn => {
  btn.addEventListener('click' , () => {
    btn.style.transition = "transform 2s ease";
    btn.style.background = "yellow";
    pressedBtn = btn;
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  })
});


//function to send post request with the pizza info
function updateCart(pizza) {
  axios__WEBPACK_IMPORTED_MODULE_0___default().post('/update-cart', pizza).then(res =>{
    pressedBtn.style.background = "#FE5F1E";
    totalCounter.innerText = res.data.totalQty;
    new (noty__WEBPACK_IMPORTED_MODULE_1___default())({
      themes : "sunset",
      layout : "bottomRight",
      type : 'success',
      timeout : 2000,
      text: 'Item added to the cart',
    }).show();
  }).catch(err => {
    new (noty__WEBPACK_IMPORTED_MODULE_1___default())({
      themes : "sunset",
      layout : "bottomRight",
      type : 'error',
      timeout : 2000,
      text: `Error : Couldn't add to cart`,
    }).show();
  });
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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 	__webpack_require__("./resources/js/js.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9yZXNvdXJjZXMvc2Nzcy9zY3NzLnNjc3MiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanMiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvLi9ub2RlX21vZHVsZXMvbm90eS9saWIvbm90eS5qcyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci8uL3Jlc291cmNlcy9zY3NzL3Njc3Muc2Nzcz82ZjgxIiwid2VicGFjazovL21vbW90cmFja2VyLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL21vbW90cmFja2VyLy4vcmVzb3VyY2VzL2pzL2pzLmpzIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9tb21vdHJhY2tlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL21vbW90cmFja2VyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbW9tb3RyYWNrZXIvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDRGQUF1QyxDOzs7Ozs7Ozs7OztBQ0ExQjs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7QUFDaEMsYUFBYSxtQkFB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QVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLE1BQU0sTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLEtBQUssS0FBSyxVQUFVLEtBQUssS0FBSyxNQUFNLEtBQUssVUFBVSxLQUFLLEtBQUssTUFBTSxLQUFLLFdBQVcsVUFBVSxLQUFLLEtBQUssTUFBTSxLQUFLLFdBQVcsVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLE1BQU0sVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsV0FBVyxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sWUFBWSxZQUFZLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsV0FBVyxZQUFZLE9BQU8sTUFBTSxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLFlBQVksV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsT0FBTyxNQUFNLFlBQVksWUFBWSxPQUFPLE1BQU0sWUFBWSxZQUFZLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsTUFBTSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxRQUFRLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxZQUFZLFlBQVksWUFBWSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sWUFBWSxRQUFRLE1BQU0sV0FBVyxPQUFPLE1BQU0sWUFBWSxZQUFZLFdBQVcsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsWUFBWSxPQUFPLE1BQU0sV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVB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QTs7QUFFQSxpQkFBaUIsc0JBQXNCO0FBQ3ZDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQixtQkFBbUI7QUFDcEM7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtDQUFrQztBQUNsQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUNBLENBQUM7QUFDRDtBQUNBLENBQUM7QUFDRDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBLFVBQVUsSUFBSTtBQUNkO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlCQUFpQix3QkFBd0I7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQiw2Q0FBNkM7QUFDOUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQSxVQUFVLE1BQU07QUFDaEIsVUFBVSxPQUFPO0FBQ2pCO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVUsTUFBTTtBQUNoQjtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBLHFCQUFxQixZQUFZO0FBQ2pDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0EsVUFBVSxJQUFJO0FBQ2Q7QUFDQSxXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0EsVUFBVSxTQUFTO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0Es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Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7OztVQ05BO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAodXRpbHMuaXNCbG9iKHJlcXVlc3REYXRhKSB8fCB1dGlscy5pc0ZpbGUocmVxdWVzdERhdGEpKSAmJlxuICAgICAgcmVxdWVzdERhdGEudHlwZVxuICAgICkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIHx8ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybFxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLm5vdHlfbGF5b3V0X21peGluLCAjbm90eV9sYXlvdXRfX2NlbnRlclJpZ2h0LCAjbm90eV9sYXlvdXRfX2NlbnRlckxlZnQsICNub3R5X2xheW91dF9fY2VudGVyLCAjbm90eV9sYXlvdXRfX2JvdHRvbVJpZ2h0LCAjbm90eV9sYXlvdXRfX2JvdHRvbUNlbnRlciwgI25vdHlfbGF5b3V0X19ib3R0b21MZWZ0LCAjbm90eV9sYXlvdXRfX2JvdHRvbSwgI25vdHlfbGF5b3V0X190b3BSaWdodCwgI25vdHlfbGF5b3V0X190b3BDZW50ZXIsICNub3R5X2xheW91dF9fdG9wTGVmdCwgI25vdHlfbGF5b3V0X190b3Age1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIHotaW5kZXg6IDk5OTk5OTk7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCkgc2NhbGUoMSwgMSk7XFxuICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBzdWJwaXhlbC1hbnRpYWxpYXNlZDtcXG4gIGZpbHRlcjogYmx1cigwKTtcXG4gIC13ZWJraXQtZmlsdGVyOiBibHVyKDApO1xcbiAgbWF4LXdpZHRoOiA5MCU7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wIHtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDUlO1xcbiAgd2lkdGg6IDkwJTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3BMZWZ0IHtcXG4gIHRvcDogMjBweDtcXG4gIGxlZnQ6IDIwcHg7XFxuICB3aWR0aDogMzI1cHg7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wQ2VudGVyIHtcXG4gIHRvcDogNSU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogMzI1cHg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3BSaWdodCB7XFxuICB0b3A6IDIwcHg7XFxuICByaWdodDogMjBweDtcXG4gIHdpZHRoOiAzMjVweDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19ib3R0b20ge1xcbiAgYm90dG9tOiAwO1xcbiAgbGVmdDogNSU7XFxuICB3aWR0aDogOTAlO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbUxlZnQge1xcbiAgYm90dG9tOiAyMHB4O1xcbiAgbGVmdDogMjBweDtcXG4gIHdpZHRoOiAzMjVweDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19ib3R0b21DZW50ZXIge1xcbiAgYm90dG9tOiA1JTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAzMjVweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbVJpZ2h0IHtcXG4gIGJvdHRvbTogMjBweDtcXG4gIHJpZ2h0OiAyMHB4O1xcbiAgd2lkdGg6IDMyNXB4O1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2NlbnRlciB7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAzMjVweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKGNhbGMoLTUwJSAtIC41cHgpLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19jZW50ZXJMZWZ0IHtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogMjBweDtcXG4gIHdpZHRoOiAzMjVweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2NlbnRlclJpZ2h0IHtcXG4gIHRvcDogNTAlO1xcbiAgcmlnaHQ6IDIwcHg7XFxuICB3aWR0aDogMzI1cHg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLCAxKTtcXG59XFxuXFxuLm5vdHlfcHJvZ3Jlc3NiYXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuXFxuLm5vdHlfaGFzX3RpbWVvdXQubm90eV9oYXNfcHJvZ3Jlc3NiYXIgLm5vdHlfcHJvZ3Jlc3NiYXIge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBsZWZ0OiAwO1xcbiAgYm90dG9tOiAwO1xcbiAgaGVpZ2h0OiAzcHg7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM2NDY0NjQ7XFxuICBvcGFjaXR5OiAwLjI7XFxuICBmaWx0ZXI6IGFscGhhKG9wYWNpdHk9MTApO1xcbn1cXG5cXG4ubm90eV9iYXIge1xcbiAgLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApIHRyYW5zbGF0ZVooMCkgc2NhbGUoMSwgMSk7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKSBzY2FsZSgxLCAxKTtcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IHN1YnBpeGVsLWFudGlhbGlhc2VkO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLm5vdHlfZWZmZWN0c19vcGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUpO1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1faW4gMC41cyBjdWJpYy1iZXppZXIoMC42OCwgLTAuNTUsIDAuMjY1LCAxLjU1KTtcXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGZvcndhcmRzO1xcbn1cXG5cXG4ubm90eV9lZmZlY3RzX2Nsb3NlIHtcXG4gIGFuaW1hdGlvbjogbm90eV9hbmltX291dCAwLjVzIGN1YmljLWJlemllcigwLjY4LCAtMC41NSwgMC4yNjUsIDEuNTUpO1xcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7XFxufVxcblxcbi5ub3R5X2ZpeF9lZmZlY3RzX2hlaWdodCB7XFxuICBhbmltYXRpb246IG5vdHlfYW5pbV9oZWlnaHQgNzVtcyBlYXNlLW91dDtcXG59XFxuXFxuLm5vdHlfY2xvc2Vfd2l0aF9jbGljayB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi5ub3R5X2Nsb3NlX2J1dHRvbiB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDJweDtcXG4gIHJpZ2h0OiAycHg7XFxuICBmb250LXdlaWdodDogYm9sZDtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgbGluZS1oZWlnaHQ6IDIwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDUpO1xcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZS1vdXQ7XFxufVxcblxcbi5ub3R5X2Nsb3NlX2J1dHRvbjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMSk7XFxufVxcblxcbi5ub3R5X21vZGFsIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gIHotaW5kZXg6IDEwMDAwO1xcbiAgb3BhY2l0eTogMC4zO1xcbiAgbGVmdDogMDtcXG4gIHRvcDogMDtcXG59XFxuXFxuLm5vdHlfbW9kYWwubm90eV9tb2RhbF9vcGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxuICBhbmltYXRpb246IG5vdHlfbW9kYWxfaW4gMC4zcyBlYXNlLW91dDtcXG59XFxuXFxuLm5vdHlfbW9kYWwubm90eV9tb2RhbF9jbG9zZSB7XFxuICBhbmltYXRpb246IG5vdHlfbW9kYWxfb3V0IDAuM3MgZWFzZS1vdXQ7XFxuICBhbmltYXRpb24tZmlsbC1tb2RlOiBmb3J3YXJkcztcXG59XFxuXFxuQGtleWZyYW1lcyBub3R5X21vZGFsX2luIHtcXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwLjM7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9vdXQge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9vdXQge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm90eV9hbmltX2luIHtcXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKTtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBub3R5X2FuaW1fb3V0IHtcXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUpO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vdHlfYW5pbV9oZWlnaHQge1xcbiAgMTAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gIH1cXG59XFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV9iYXIge1xcbiAgbWFyZ2luOiA0cHggMDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBib3JkZXItcmFkaXVzOiAycHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfYmFyIC5ub3R5X2JvZHkge1xcbiAgcGFkZGluZzogMTBweDtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG59XFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV9iYXIgLm5vdHlfYnV0dG9ucyB7XFxuICBwYWRkaW5nOiAxMHB4O1xcbn1cXG5cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2FsZXJ0LFxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fbm90aWZpY2F0aW9uIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI0QxRDFEMTtcXG4gIGNvbG9yOiAjMkYyRjJGO1xcbn1cXG5cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX3dhcm5pbmcge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGQUU0MjtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjRTg5RjNDO1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fZXJyb3Ige1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI0RFNjM2RjtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjQ0E1QTY1O1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9faW5mbyxcXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX2luZm9ybWF0aW9uIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM3RjdFRkY7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzc0NzNFODtcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubm90eV90aGVtZV9fbWludC5ub3R5X3R5cGVfX3N1Y2Nlc3Mge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI0FGQzc2NTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjQTBCNTVDO1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbioge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5cXG5odG1sLFxcbmJvZHkge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcblxcbmJ1dHRvbjpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbn1cXG5cXG5ib2R5IHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGF0b1xcXCIsIFxcXCJzYW5zLXNlcmlmXFxcIjtcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xcbiAgY29sb3I6ICMyMzIzMjM7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuXFxubmF2IHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIG1pbi1oZWlnaHQ6IDEyMHB4O1xcbn1cXG5cXG4ubmF2LXdyYXBwZXIge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcGFkZGluZzogMTBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMjAlO1xcbiAgcmlnaHQ6IDElO1xcbn1cXG5cXG4ubmF2LXdyYXBwZXIgdWwgbGkge1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgbWFyZ2luOiAwIDEwcHg7XFxuICBwYWRkaW5nOiA1cHg7XFxuICBmb250LXNpemU6IDE4cHg7XFxufVxcblxcbi5uYXYtd3JhcHBlciB1bCBsaTpsYXN0LWNoaWxkIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuLnRvdGFsLWNvdW50ZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYmFja2dyb3VuZDogIzY0YTBmZjtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgcGFkZGluZzogMnB4IDBweCAwIDZweDtcXG4gIGZvbnQtc2l6ZTogMTNweDtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgdG9wOiAtMTAlO1xcbiAgcmlnaHQ6IC0yMCU7XFxufVxcblxcbi5uYXYtd3JhcHBlciB1bCBsaSBhIHtcXG4gIGNvbG9yOiAjRkU1RjFFO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG4uY2FydCB7XFxuICB3aWR0aDogNDRweDtcXG4gIGhlaWdodDogMzBweDtcXG59XFxuXFxuLmxvZ28td3JhcHBlciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDUlO1xcbiAgbGVmdDogMCU7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxufVxcblxcbi5sb2dvLXdyYXBwZXIgaW1nIHtcXG4gIHdpZHRoOiAxNTBweDtcXG4gIGhlaWdodDogMTIwcHg7XFxufVxcblxcbi5sb2dvLXdyYXBwZXIgc3BhbiB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDQwJTtcXG4gIGxlZnQ6IDEwMCU7XFxuICBsZXR0ZXItc3BhY2luZzogNnB4O1xcbiAgY29sb3I6ICNGRTVGMUU7XFxuICBmb250LXNpemU6IDIzcHg7XFxuICBmb250LXdlaWdodDogNjAwO1xcbn1cXG5cXG4uaW50cm8tY29udGFpbmVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogODAlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kOiAjZjhmOGY4O1xcbiAgbGVmdDogMDtcXG59XFxuXFxuLmJhbm5lciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICByaWdodDogMCU7XFxuICB0b3A6IDE0JTtcXG4gIHdpZHRoOiAzNCU7XFxuICBoZWlnaHQ6IDc5JTtcXG59XFxuXFxuLmNhcHRpb24ge1xcbiAgZm9udC1zaXplOiAyMHB4O1xcbiAgbGV0dGVyLXNwYWNpbmc6IDJweDtcXG4gIHBhZGRpbmc6IDEwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDQwJTtcXG4gIGxlZnQ6IDUlO1xcbn1cXG5cXG4uY2FwdGlvbiBoMSB7XFxuICBjb2xvcjogIzIzMjMyMztcXG4gIGZvbnQtc2l6ZTogNTBweDtcXG4gIGxldHRlci1zcGFjaW5nOiA2cHg7XFxuICBtYXJnaW46IDIwcHggMDtcXG59XFxuXFxuLm9yZGVyIHtcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHBhZGRpbmc6IDdweDtcXG4gIGJvcmRlcjogMXB4IHdoaXRlIHNvbGlkO1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgd2lkdGg6IDYwJTtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4ub3JkZXI6aG92ZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzIzMjMyMztcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubmF2LXdyYXBwZXIgdWwgbGkgYTpob3ZlciB7XFxuICBjb2xvcjogIzIzMjMyMztcXG59XFxuXFxuLm1lbnUtY29udGFpbmVyIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG5cXG4ubWVudS1jb250YWluZXIgaDIge1xcbiAgZm9udC1zaXplOiAzMHB4O1xcbiAgbWFyZ2luOiAzMHB4O1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICBjb2xvcjogI0ZFNUYxRTtcXG4gIGxldHRlci1zcGFjaW5nOiA1cHg7XFxufVxcblxcbi5tZW51LWl0ZW0gaW1nIHtcXG4gIHdpZHRoOiA1MCU7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgbWFyZ2luOiBhdXRvO1xcbn1cXG5cXG4ubWVudS1pdGVtIC5pdGVtLW5hbWUge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDJweDtcXG4gIGZvbnQtc2l6ZTogMThweDtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbiAgbWFyZ2luOiA1cHggMDtcXG59XFxuXFxuLm1lbnUtaXRlbSAuaXRlbS1wcmljZSB7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB3aWR0aDogNDAlO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG4gIHBhZGRpbmc6IDVweDtcXG4gIHBhZGRpbmctbGVmdDogMjBweDtcXG4gIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICBjb2xvcjogIzIzMjMyMztcXG59XFxuXFxuLm1lbnUtaXRlbSBidXR0b24ge1xcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgd29yZC1zcGFjaW5nOiAxMHB4O1xcbiAgcGFkZGluZzogNXB4O1xcbiAgYm9yZGVyOiAxcHggd2hpdGUgc29saWQ7XFxuICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICBtYXJnaW4tbGVmdDogMzBweDtcXG59XFxuXFxuLm1lbnUtaXRlbSBidXR0b246Zm9jdXMge1xcbiAgb3V0bGluZTogbm9uZTtcXG59XFxuXFxuLmNhcnQtZW1wdHkgaDEsIC5jYXJ0LW5vbmVtcHR5IGgxIHtcXG4gIGNvbG9yOiAjMjMyMzIzO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGZvbnQtc2l6ZTogMzBweDtcXG4gIG1hcmdpbjogMjBweCAwO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDNweDtcXG59XFxuXFxuLmNhcnQtZW1wdHkgcCB7XFxuICBmb250LXNpemU6IDIwcHg7XFxuICBtYXJnaW46IGF1dG87XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBwYWRkaW5nOiA1cHg7XFxufVxcblxcbi5pbWctd3JhcHBlciB7XFxuICB3aWR0aDogNDAlO1xcbiAgbWFyZ2luOiBhdXRvO1xcbn1cXG5cXG4uaW1nLXdyYXBwZXIgaW1nIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5cXG4uY2FydC1lbXB0eSBhIHtcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHBhZGRpbmc6IDdweDtcXG4gIGJvcmRlcjogMXB4IHdoaXRlIHNvbGlkO1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgd2lkdGg6IDEwMHB4O1xcbiAgbWFyZ2luOiAxMHB4IGF1dG87XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLmNhcnQtZW1wdHkgYTpob3ZlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjMyMzIzO1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5jYXJ0LW5vbmVtcHR5IHtcXG4gIGJhY2tncm91bmQ6ICNmOGY4Zjg7XFxuICBtaW4taGVpZ2h0OiAxMDAlO1xcbn1cXG5cXG4uY291bnRlci1jb250YWluZXIge1xcbiAgd2lkdGg6IDcwJTtcXG4gIG1hcmdpbjogYXV0bztcXG59XFxuXFxuLmNhcnQtbm9uZW1wdHkgaDEge1xcbiAgZm9udC1zaXplOiAyMHB4O1xcbiAgcGFkZGluZzogMjBweDtcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxuICBsZXR0ZXItc3BhY2luZzogMnB4O1xcbn1cXG5cXG4uY291bnRlciB7XFxuICBwYWRkaW5nLWJvdHRvbTogMTVweDtcXG4gIGJvcmRlci1ib3R0b206IDFweCAjY2NjIHNvbGlkO1xcbn1cXG5cXG4ucGl6emEtZGlzcGxheSBpbWcge1xcbiAgd2lkdGg6IDMwJTtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgbWFyZ2luOiBhdXRvO1xcbn1cXG5cXG4ucGl6emEtbmFtZSB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAxOHB4O1xcbiAgY29sb3I6ICNGRTVGMUU7XFxufVxcblxcbi5waXp6YS1zaXplIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBjb2xvcjogI2NjYztcXG59XFxuXFxuLnBpenphLXByaWNlLCAucGl6emEtbnVtYmVyIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXNpemU6IDE4cHg7XFxuICBjb2xvcjogIzIzMjMyMztcXG59XFxuXFxuLnRvdGFsIHtcXG4gIHBhZGRpbmc6IDIwcHg7XFxuICB0ZXh0LWFsaWduOiByaWdodDtcXG59XFxuXFxuLnRvdGFsIHNwYW4ge1xcbiAgY29sb3I6ICNGRTVGMUU7XFxuICBwYWRkaW5nOiAwIDVweDtcXG59XFxuXFxuLmFkZHJlc3Mge1xcbiAgbWFyZ2luOiAxMHB4IDA7XFxuICB0ZXh0LWFsaWduOiByaWdodDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuLmFkZHJlc3MgaW5wdXQge1xcbiAgd2lkdGg6IDQwJTtcXG4gIGhlaWdodDogMjBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHBhZGRpbmc6IDEwcHg7XFxuICByaWdodDogMDtcXG4gIGJvcmRlcjogMXB4ICNjY2Mgc29saWQ7XFxuICBib3JkZXItcmFkaXVzOiAxcHg7XFxufVxcblxcbi5hZGRyZXNzIGJ1dHRvbiB7XFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcbiAgY29sb3I6ICNmZmY7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogN3B4O1xcbiAgZm9udC1zaXplOiAxNXB4O1xcbiAgYm9yZGVyOiAxcHggI2NjYyBzb2xpZDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNDBweDtcXG4gIHJpZ2h0OiAwO1xcbn1cXG5cXG4ubG9naW4tY29udGFpbmVyLCAucmVnaXN0ZXItY29udGFpbmVyIHtcXG4gIGJhY2tncm91bmQ6ICNmOGY4Zjg7XFxufVxcblxcbi5sb2dpbi1jb250YWluZXIgaW5wdXQsIC5yZWdpc3Rlci1jb250YWluZXIgaW5wdXQge1xcbiAgbWFyZ2luOiAyMHB4IGF1dG87XFxufVxcblxcbi5sb2dpbi1idXR0b24ge1xcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiAxNnB4O1xcbiAgcGFkZGluZzogMTBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxuICBib3JkZXI6IDFweCAjY2NjIHNvbGlkO1xcbn1cXG5cXG4ubG9naW4tYnV0dG9uOmhvdmVyIHtcXG4gIGJhY2tncm91bmQ6IGJsYWNrO1xcbn1cXG5cXG4uZm9yZ290LXB3IHtcXG4gIGNvbG9yOiAjRkU1RjFFO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuXFxuLmZvcmdvdC1wdzpob3ZlciB7XFxuICBjb2xvcjogIzIzMjMyMztcXG59XFxuXFxuLmF1dGgtZXJyb3Ige1xcbiAgY29sb3I6IHJlZDtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG4gIHBhZGRpbmc6IDEwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbi5sb2dnZWQtaW4tbmFtZSB7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBmb250LXdlaWdodDogNTAxO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAxMCU7XFxuICByaWdodDogOSU7XFxuICBjb2xvcjogb3JhbmdlO1xcbn1cXG5cXG4ubm90LWxvZ2dlZC1pbi1tc2cge1xcbiAgY29sb3I6IHJlZDtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4ubm90LWxvZ2dlZC1pbi1tc2cgYSB7XFxuICBjb2xvcjogYmx1ZTtcXG4gIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcGFkZGluZzogMCA1cHg7XFxufVxcblxcbi5vcmRlci10aGVhZCB7XFxuICBwYWRkaW5nOiA1cHg7XFxuICBib3JkZXI6IDFweCBzb2xpZCBncmF5O1xcbn1cXG5cXG4ub3JkZXItdGhlYWQgZGl2IHtcXG4gIGJvcmRlci1sZWZ0OiAxcHggc29saWQgZ3JheTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuLm9yZGVyLXJvdyB7XFxuICBwYWRkaW5nOiA1cHg7XFxuICB0cmFuc2l0aW9uOiBhbGwgM3MgZWFzZTtcXG59XFxuXFxuLm9yZGVyLXJvdyBkaXYge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgcGFkZGluZzogM3B4O1xcbiAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCBncmF5O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIGdyYXk7XFxufVxcblxcbkBrZXlmcmFtZXMgc2hha2Uge1xcbiAgMzMlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNTBkZWcpO1xcbiAgfVxcbiAgNjYlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoLTUwZGVnKTtcXG4gIH1cXG59XFxuLnRyYWNrLWNvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kOiAjZjhmOGY4O1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDYwMHB4O1xcbn1cXG5cXG4udHJhY2tpbmctc2VjdGlvbiB7XFxuICB3aWR0aDogNzAlO1xcbiAgbWFyZ2luOiAyMHB4IGF1dG87XFxuICBwYWRkaW5nLXRvcDogMTAwcHg7XFxuICBoZWlnaHQ6IDUwMHB4O1xcbn1cXG5cXG4ub3JkZXItaW5mbyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi5vcmRlci1pbmZvIGgxIHtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcblxcbi5vcmRlci1pbmZvIC5vcmRlci1pZCB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICByaWdodDogMDtcXG4gIGNvbG9yOiBvcmFuZ2U7XFxufVxcblxcbi5vcmRlci1zdGF0dXMge1xcbiAgbWFyZ2luOiA1MHB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogMTglO1xcbiAgdG9wOiAzJTtcXG59XFxuXFxuLm9yZGVyLXN0YXR1cyBsaSB7XFxuICBtYXJnaW46IDUwcHg7XFxuICB3aWR0aDogMzAwcHg7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZXR0ZXItc3BhY2luZzogMS41cHg7XFxufVxcblxcbi5vcmRlci1zdGF0dXMgbGkgLmljb24ge1xcbiAgZm9udC1zaXplOiAzMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgcmlnaHQ6IDA7XFxuICB0b3A6IC01cHg7XFxuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMnMgZWFzZTtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMS4yKTtcXG59XFxuXFxuLm9yZGVycy1zbWFsbCB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4ub3JkZXItc3RhdHVzIGxpOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGJhY2tncm91bmQ6IGJsYWNrO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgd2lkdGg6IDEwcHg7XFxuICBoZWlnaHQ6IDEwcHg7XFxuICByaWdodDogODhweDtcXG4gIHRvcDogN3B4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG5cXG4ub3JkZXItc3RhdHVzIGxpOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgYmFja2dyb3VuZDogYmxhY2s7XFxuICB3aWR0aDogMnB4O1xcbiAgaGVpZ2h0OiAxODglO1xcbiAgbWFyZ2luLXRvcDogMTVweDtcXG4gIHJpZ2h0OiA5MnB4O1xcbiAgdG9wOiAxMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA2NTBweCkge1xcbiAgLm1lbnUtaXRlbSAuaXRlbS1wcmljZSB7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIH1cXG5cXG4gIC5iYW5uZXIge1xcbiAgICByaWdodDogMSU7XFxuICAgIHRvcDogNDElO1xcbiAgICB3aWR0aDogNDMlO1xcbiAgICBoZWlnaHQ6IDE4MHB4O1xcbiAgfVxcblxcbiAgLm9yZGVyLXN0YXR1cyB7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIHRvcDogNSU7XFxuICB9XFxuXFxuICAub3JkZXItaW5mbyB7XFxuICAgIHBhZGRpbmc6IDEwcHg7XFxuICB9XFxuXFxuICAub3JkZXItaW5mbyBoMSB7XFxuICAgIHBvc2l0aW9uOiBzdGF0aWM7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gIH1cXG5cXG4gIC5vcmRlci1pbmZvIC5vcmRlci1pZCB7XFxuICAgIHBvc2l0aW9uOiBzdGF0aWM7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gIH1cXG5cXG4gIC50cmFja2luZy1zZWN0aW9uIHtcXG4gICAgcGFkZGluZy10b3A6IDM2cHg7XFxuICB9XFxuXFxuICAub3JkZXItc3RhdHVzIGxpIHtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgICBtYXJnaW46IDMwcHg7XFxuICB9XFxuXFxuICAudHJhY2tpbmctY29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA0NTBweDtcXG4gIH1cXG5cXG4gIC50cmFja2luZy1zZWN0aW9uIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICB9XFxuXFxuICAub3JkZXJzLXNtYWxsIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICB9XFxuXFxuICAuc3VjY2Vzcy1hbGVydCB7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gIH1cXG5cXG4gIC5vcmRlcnMge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcblxcbiAgLmF1dGgtZXJyb3Ige1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICB9XFxuXFxuICAuY2FwdGlvbiB7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gICAgdG9wOiAxNyU7XFxuICAgIGxlZnQ6IDQlO1xcbiAgfVxcblxcbiAgLm9yZGVyIHtcXG4gICAgd2lkdGg6IDUwJTtcXG4gIH1cXG5cXG4gIC5jYXB0aW9uIGgxIHtcXG4gICAgZm9udC1zaXplOiAzNXB4O1xcbiAgfVxcblxcbiAgLmludHJvLWNvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNTAlO1xcbiAgfVxcblxcbiAgLm1lbnUtY29udGFpbmVyIGgyIHtcXG4gICAgZm9udC1zaXplOiAyMHB4O1xcbiAgfVxcblxcbiAgLm1lbnUtaXRlbSBpbWcge1xcbiAgICBoZWlnaHQ6IDkwcHg7XFxuICB9XFxuXFxuICAubWVudS1pdGVtIC5pdGVtLW5hbWUge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICB9XFxuXFxuICAubG9nby13cmFwcGVyIGltZyB7XFxuICAgIG1hcmdpbjogNXB4O1xcbiAgICBkaXNwbGF5OiBpbmxpbmU7XFxuICAgIGhlaWdodDogMTAwcHg7XFxuICB9XFxuXFxuICAubG9nby13cmFwcGVyIHtcXG4gICAgcG9zaXRpb246IHN0YXRpYztcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG5cXG4gIC5sb2dvLXdyYXBwZXIgc3BhbiB7XFxuICAgIHBvc2l0aW9uOiBzdGF0aWM7XFxuICB9XFxuXFxuICAubmF2LXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBwb3NpdGlvbjogc3RhdGljO1xcbiAgfVxcblxcbiAgLmNhcnQtbm9uZW1wdHkgaDEge1xcbiAgICBmb250LXNpemU6IDE2cHg7XFxuICB9XFxuXFxuICAubm90LWxvZ2dlZC1pbi1tc2cge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICAgIHBhZGRpbmc6IDA7XFxuICB9XFxuXFxuICAudG90YWwge1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICB9XFxuXFxuICAucGl6emEtbmFtZSwgLnBpenphLXNpemUsIC5waXp6YS1udW1iZXIsIC5waXp6YS1wcmljZSB7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gIH1cXG5cXG4gIC5jYXJ0LW5vbmVtcHR5IHtcXG4gICAgbWluLWhlaWdodDogMDtcXG4gIH1cXG5cXG4gIC5zaWduLWluLW1zZyB7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gIH1cXG5cXG4gIC5sb2dpbi1jb250YWluZXIgaW5wdXQsIC5yZWdpc3Rlci1jb250YWluZXIgaW5wdXQge1xcbiAgICBwYWRkaW5nOiA1cHg7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gICAgbWFyZ2luOiAyMHB4IGF1dG87XFxuICB9XFxuXFxuICAubG9naW4tYnV0dG9uIHtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgfVxcblxcbiAgLmFkZHJlc3MgaW5wdXQge1xcbiAgICB3aWR0aDogODAlO1xcbiAgfVxcblxcbiAgLmFkZHJlc3MgYnV0dG9uIHtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgfVxcblxcbiAgLmxvZ2dlZC1pbi1uYW1lIHtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgICB0b3A6IDUlO1xcbiAgfVxcblxcbiAgLmNhcnQtZW1wdHkgcCB7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gIH1cXG5cXG4gIC5jYXJ0LWVtcHR5IGgxIHtcXG4gICAgZm9udC1zaXplOiAyMHB4O1xcbiAgfVxcblxcbiAgLmNhcnQtZW1wdHkgYSB7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gIH1cXG5cXG4gIC5mb3Jnb3QtcHcge1xcbiAgICBmb250LXNpemU6IDE1cHg7XFxuICB9XFxuXFxuICAudG90YWwtY291bnRlciB7XFxuICAgIHBhZGRpbmc6IDJweDtcXG4gIH1cXG5cXG4gIC5uYXYtd3JhcHBlciB1bCBsaSB7XFxuICAgIHBhZGRpbmc6IDFweDtcXG4gIH1cXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vbm9kZV9tb2R1bGVzL25vdHkvc3JjL25vdHkuc2Nzc1wiLFwid2VicGFjazovLy4vcmVzb3VyY2VzL3Njc3Mvc2Nzcy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9ub2RlX21vZHVsZXMvbm90eS9zcmMvdGhlbWVzL21pbnQuc2Nzc1wiLFwid2VicGFjazovLy4vcmVzb3VyY2VzL3Njc3MvX3ZhcmlhYmxlcy5zY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUlBO0VBQ0UsZUFBQTtFQUNBLFNBQUE7RUFDQSxVQUFBO0VBQ0EsZ0JBQUE7RUFDQSxvQ0FBQTtFQUNBLDJCQUFBO0VBQ0EsNENBQUE7RUFDQSxlQUFBO0VBQ0EsdUJBQUE7RUFDQSxjQUFBO0FDSEY7O0FETUE7RUFFRSxNQUFBO0VBQ0EsUUFBQTtFQUNBLFVBQUE7QUNKRjs7QURPQTtFQUVFLFNBeEJrQjtFQXlCbEIsVUF6QmtCO0VBMEJsQixZQTNCbUI7QUNzQnJCOztBRFFBO0VBRUUsT0FBQTtFQUNBLFNBQUE7RUFDQSxZQWxDbUI7RUFtQ25CLGlFQUFBO0FDTkY7O0FEU0E7RUFFRSxTQXZDa0I7RUF3Q2xCLFdBeENrQjtFQXlDbEIsWUExQ21CO0FDbUNyQjs7QURVQTtFQUVFLFNBQUE7RUFDQSxRQUFBO0VBQ0EsVUFBQTtBQ1JGOztBRFdBO0VBRUUsWUFyRGtCO0VBc0RsQixVQXREa0I7RUF1RGxCLFlBeERtQjtBQytDckI7O0FEWUE7RUFFRSxVQUFBO0VBQ0EsU0FBQTtFQUNBLFlBL0RtQjtFQWdFbkIsaUVBQUE7QUNWRjs7QURhQTtFQUVFLFlBcEVrQjtFQXFFbEIsV0FyRWtCO0VBc0VsQixZQXZFbUI7QUM0RHJCOztBRGNBO0VBRUUsUUFBQTtFQUNBLFNBQUE7RUFDQSxZQTlFbUI7RUErRW5CLG9GQUFBO0FDWkY7O0FEZUE7RUFFRSxRQUFBO0VBQ0EsVUFwRmtCO0VBcUZsQixZQXRGbUI7RUF1Rm5CLG9FQUFBO0FDYkY7O0FEZ0JBO0VBRUUsUUFBQTtFQUNBLFdBNUZrQjtFQTZGbEIsWUE5Rm1CO0VBK0ZuQixvRUFBQTtBQ2RGOztBRGlCQTtFQUNFLGFBQUE7QUNkRjs7QURpQkE7RUFDRSxjQUFBO0VBQ0Esa0JBQUE7RUFDQSxPQUFBO0VBQ0EsU0FBQTtFQUNBLFdBQUE7RUFDQSxXQUFBO0VBQ0EseUJBQUE7RUFDQSxZQUFBO0VBQ0EseUJBQUE7QUNkRjs7QURpQkE7RUFDRSxtQ0FBQTtFQUNBLDREQUFBO0VBQ0Esc0NBQUE7RUFDQSw0Q0FBQTtFQUNBLGdCQUFBO0FDZEY7O0FEaUJBO0VBQ0UsVUFBQTtFQUNBLHlCQUFBO0VBQ0EsbUVBQUE7RUFDQSw2QkFBQTtBQ2RGOztBRGlCQTtFQUNFLG9FQUFBO0VBQ0EsNkJBQUE7QUNkRjs7QURpQkE7RUFDRSx5Q0FBQTtBQ2RGOztBRGlCQTtFQUNFLGVBQUE7QUNkRjs7QURpQkE7RUFDRSxrQkFBQTtFQUNBLFFBQUE7RUFDQSxVQUFBO0VBQ0EsaUJBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsaUJBQUE7RUFDQSxxQ0FBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLDZCQUFBO0FDZEY7O0FEaUJBO0VBQ0Usb0NBQUE7QUNkRjs7QURpQkE7RUFDRSxlQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxzQkFBQTtFQUNBLGNBQUE7RUFDQSxZQUFBO0VBQ0EsT0FBQTtFQUNBLE1BQUE7QUNkRjs7QURpQkE7RUFDRSxVQUFBO0VBQ0Esc0NBQUE7QUNkRjs7QURnQkE7RUFDRSx1Q0FBQTtFQUNBLDZCQUFBO0FDYkY7O0FEZ0JBO0VBQ0U7SUFDRSxZQUFBO0VDYkY7QUFDRjtBRGVBO0VBQ0U7SUFDRSxVQUFBO0VDYkY7QUFDRjtBRGdCQTtFQUNFO0lBQ0UsVUFBQTtFQ2RGO0FBQ0Y7QURpQkE7RUFDRTtJQUNFLHVCQUFBO0lBQ0EsVUFBQTtFQ2ZGO0FBQ0Y7QURrQkE7RUFDRTtJQUNFLHlCQUFBO0lBQ0EsVUFBQTtFQ2hCRjtBQUNGO0FEbUJBO0VBQ0U7SUFDRSxTQUFBO0VDakJGO0FBQ0Y7QUN2TUE7RUFDRSxhQUFBO0VBQ0EsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLGtCQUFBO0FEeU1GO0FDdk1FO0VBQ0QsYUFBQTtFQUNBLGVBQUE7QUR5TUQ7QUN0TUU7RUFDRCxhQUFBO0FEd01EOztBQ3BNQTs7RUFFRSxzQkFBQTtFQUNBLGdDQUFBO0VBQ0EsY0FBQTtBRHVNRjs7QUNwTUE7RUFDRSx5QkFBQTtFQUNBLGdDQUFBO0VBQ0EsV0FBQTtBRHVNRjs7QUNwTUE7RUFDRSx5QkFBQTtFQUNBLGdDQUFBO0VBQ0EsV0FBQTtBRHVNRjs7QUNwTUE7O0VBRUUseUJBQUE7RUFDQSxnQ0FBQTtFQUNBLFdBQUE7QUR1TUY7O0FDcE1BO0VBQ0UseUJBQUE7RUFDQSxnQ0FBQTtFQUNBLFdBQUE7QUR1TUY7O0FBalBBO0VBQ0UsU0FBQTtBQW9QRjs7QUFqUEE7O0VBRUUsWUFBQTtFQUNBLFdBQUE7QUFvUEY7O0FBalBBO0VBQ0UsYUFBQTtBQW9QRjs7QUFqUEE7RUFDRSxpQ0FBQTtFQUNBLG1DQUFBO0VBQ0EsY0FBQTtFQUNBLFdBQUE7QUFvUEY7O0FBalBBO0VBQ0Usa0JBQUE7RUFDQSxpQkFBQTtBQW9QRjs7QUFqUEE7RUFDRSxxQkFBQTtFQUNBLGFBQUE7RUFDQSxrQkFBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0FBb1BGOztBQWpQQTtFQUNFLHFCQUFBO0VBQ0EsY0FBQTtFQUNBLFlBQUE7RUFDQSxlQUFBO0FBb1BGOztBQWpQQTtFQUNBLGtCQUFBO0FBb1BBOztBQWpQQTtFQUNJLGtCQUFBO0VBQ0EsbUJBQUE7RUFDQSxZQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLHNCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsU0FBQTtFQUNBLFdBQUE7QUFvUEo7O0FBalBBO0VBQ0UsY0FBQTtFQUNBLHFCQUFBO0FBb1BGOztBQWpQQTtFQUNFLFdBQUE7RUFDQSxZQUFBO0FBb1BGOztBQWpQQTtFQUNFLGtCQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxxQkFBQTtBQW9QRjs7QUFqUEE7RUFDRSxZQUFBO0VBQ0EsYUFBQTtBQW9QRjs7QUFqUEE7RUFDRSxrQkFBQTtFQUNBLFFBQUE7RUFDQSxVQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0FBb1BGOztBQWpQQTtFQUNFLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLFdBQUE7RUFDQSxtQkFBQTtFQUNBLE9BQUE7QUFvUEY7O0FBalBBO0VBQ0Usa0JBQUE7RUFDQSxTQUFBO0VBQ0EsUUFBQTtFQUNBLFVBQUE7RUFDQSxXQUFBO0FBb1BGOztBQWpQQTtFQUNFLGVBQUE7RUFDQSxtQkFBQTtFQUNBLGFBQUE7RUFDQSxrQkFBQTtFQUNBLFFBQUE7RUFDQSxRQUFBO0FBb1BGOztBQWpQQTtFQUNFLGNBQUE7RUFDQSxlQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0FBb1BGOztBQWpQQTtFQUNFLG1CQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSx1QkFBQTtFQUNBLGtCQUFBO0VBQ0EscUJBQUE7RUFDQSxVQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0FBb1BGOztBQWpQQTtFQUNBLHlCRXRJTTtFRnVJTixXRXhJTTtBRjRYTjs7QUFoUEE7RUFDRSxjQUFBO0FBbVBGOztBQWhQQTtFQUNFLFlBQUE7RUFDQSxrQkFBQTtFQUNBLFdBQUE7QUFtUEY7O0FBaFBBO0VBQ0UsZUFBQTtFQUNBLFlBQUE7RUFDQSxpQkFBQTtFQUNBLGNFN0pRO0VGOEpSLG1CQUFBO0FBbVBGOztBQWhQQTtFQUNFLFVBQUE7RUFDQSxXQUFBO0VBQ0EsY0FBQTtFQUNBLFlBQUE7QUFtUEY7O0FBaFBBO0VBQ0UsY0FBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxtQkFBQTtFQUNBLGVBQUE7RUFDQSxjQUFBO0VBQ0EsYUFBQTtBQW1QRjs7QUFoUEE7RUFDRSxxQkFBQTtFQUNBLFVBQUE7RUFDQSxnQkFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsY0FBQTtBQW1QRjs7QUFoUEE7RUFDRSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxrQkFBQTtFQUNBLFlBQUE7RUFDQSx1QkFBQTtFQUNBLGtCQUFBO0VBQ0EsaUJBQUE7QUFtUEY7O0FBL09BO0VBQ0UsYUFBQTtBQWtQRjs7QUEvT0E7RUFDRSxjRXhNSTtFRnlNSixrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGNBQUE7RUFDQSxtQkFBQTtBQWtQRjs7QUEvT0E7RUFDRSxlQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsWUFBQTtBQWtQRjs7QUEvT0E7RUFDRSxVQUFBO0VBQ0EsWUFBQTtBQWtQRjs7QUEvT0E7RUFDRSxXQUFBO0VBQ0EsWUFBQTtBQWtQRjs7QUEvT0E7RUFDRSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0EsdUJBQUE7RUFDQSxrQkFBQTtFQUNBLHFCQUFBO0VBQ0EsWUFBQTtFQUNBLGlCQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0FBa1BGOztBQS9PQTtFQUNBLHlCRS9PTTtFRmdQTixXRWpQTTtBRm1lTjs7QUEvT0E7RUFDRSxtQkV0UFU7RUZ1UFYsZ0JBQUE7QUFrUEY7O0FBL09BO0VBQ0UsVUFBQTtFQUNBLFlBQUE7QUFrUEY7O0FBL09BO0VBQ0UsZUFBQTtFQUNBLGFBQUE7RUFDQSxnQkFBQTtFQUNBLG1CQUFBO0FBa1BGOztBQS9PQTtFQUNBLG9CQUFBO0VBQ0EsNkJBQUE7QUFrUEE7O0FBOU9BO0VBQ0EsVUFBQTtFQUNBLGNBQUE7RUFDQSxZQUFBO0FBaVBBOztBQTlPQTtFQUNFLGNBQUE7RUFDQSxXQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0VBQ0EsY0V6UlE7QUYwZ0JWOztBQTlPQTtFQUNFLGNBQUE7RUFDQSxXQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0VBQ0EsV0U1Ukk7QUY2Z0JOOztBQTlPQTtFQUNFLGNBQUE7RUFDQSxXQUFBO0VBQ0Esa0JBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7RUFDQSxjRXRTSTtBRnVoQk47O0FBOU9BO0VBQ0UsYUFBQTtFQUNDLGlCQUFBO0FBaVBIOztBQTlPQTtFQUNDLGNFblRTO0VGb1RULGNBQUE7QUFpUEQ7O0FBOU9BO0VBQ0UsY0FBQTtFQUNBLGlCQUFBO0VBQ0Esa0JBQUE7QUFpUEY7O0FBOU9BO0VBQ0UsVUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGFBQUE7RUFDQSxRQUFBO0VBQ0Esc0JBQUE7RUFDQSxrQkFBQTtBQWlQRjs7QUE5T0E7RUFDRSxtQkV4VVE7RUZ5VVIsV0V0VUk7RUZ1VUosbUJBQUE7RUFDQSxZQUFBO0VBQ0EsZUFBQTtFQUNBLHNCQUFBO0VBQ0Esa0JBQUE7RUFDQSxTQUFBO0VBQ0EsUUFBQTtBQWlQRjs7QUE1T0E7RUFDRSxtQkVwVlU7QUZta0JaOztBQTVPQTtFQUNFLGlCQUFBO0FBK09GOztBQTVPQTtFQUNFLG1CRTlWUTtFRitWUixXRTVWSTtFRjZWSixlQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0Esc0JBQUE7QUErT0Y7O0FBNU9BO0VBQ0UsaUJBQUE7QUErT0Y7O0FBN09BO0VBQ0UsY0UxV1E7RUYyV1IsZ0JBQUE7QUFnUEY7O0FBN09BO0VBQ0UsY0UzV0k7QUYybEJOOztBQTdPQTtFQUNFLFVBQUE7RUFDQSxlQUFBO0VBQ0EsYUFBQTtFQUNBLGtCQUFBO0FBZ1BGOztBQTdPQTtFQUNFLGVBQUE7RUFDRixnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFNBQUE7RUFDQSxhQUFBO0FBZ1BBOztBQTdPQTtFQUNFLFVBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxhQUFBO0VBQ0Esa0JBQUE7QUFnUEY7O0FBN09BO0VBQ0UsV0FBQTtFQUNBLDBCQUFBO0VBQ0EscUJBQUE7RUFDQSxjQUFBO0FBZ1BGOztBQTdPQTtFQUNFLFlBQUE7RUFDQSxzQkFBQTtBQWdQRjs7QUE3T0E7RUFDRSwyQkFBQTtFQUNBLGtCQUFBO0FBZ1BGOztBQTdPQTtFQUNFLFlBQUE7RUFDQSx1QkFBQTtBQWdQRjs7QUE3T0E7RUFDRSxrQkFBQTtFQUNBLFlBQUE7RUFDQSwyQkFBQTtFQUNBLDZCQUFBO0FBZ1BGOztBQTdPQTtFQUNFO0lBQ0Usd0JBQUE7RUFnUEY7RUE3T0E7SUFDRSx5QkFBQTtFQStPRjtBQUNGO0FBNU9BO0VBQ0UsbUJBQUE7RUFDQSxXQUFBO0VBQ0EsYUFBQTtBQThPRjs7QUEzT0E7RUFDRSxVQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtFQUNBLGFBQUE7QUE4T0Y7O0FBM09BO0VBQ0Usa0JBQUE7QUE4T0Y7O0FBM09BO0VBQ0UsZ0JBQUE7RUFDRixrQkFBQTtBQThPQTs7QUEzT0E7RUFDRSxrQkFBQTtFQUNFLFFBQUE7RUFDQSxhQUFBO0FBOE9KOztBQTNPQTtFQUNFLFlBQUE7RUFDQSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxPQUFBO0FBOE9GOztBQTNPQTtFQUNFLFlBQUE7RUFDQSxZQUFBO0VBQ0UsZUFBQTtFQUNBLGtCQUFBO0VBQ0EscUJBQUE7QUE4T0o7O0FBM09BO0VBQ0UsZUFBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFNBQUE7RUFDQSw2QkFBQTtFQUNBLHFCQUFBO0FBOE9GOztBQTNPQTtFQUNFLGFBQUE7QUE4T0Y7O0FBM09BO0VBQ0UsV0FBQTtFQUNBLGlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLFdBQUE7RUFDQSxRQUFBO0VBQ0Esa0JBQUE7QUE4T0Y7O0FBM09BO0VBQ0UsV0FBQTtFQUNFLGlCQUFBO0VBQ0EsVUFBQTtFQUNBLFlBQUE7RUFDQSxnQkFBQTtFQUNBLFdBQUE7RUFDQSxTQUFBO0VBQ0Esa0JBQUE7QUE4T0o7O0FBMU9BO0VBQ0U7SUFDRSxrQkFBQTtFQTZPRjs7RUEzT0E7SUFDRSxTQUFBO0lBQ0QsUUFBQTtJQUNBLFVBQUE7SUFDQSxhQUFBO0VBOE9EOztFQTNPRDtJQUNFLFNBQUE7SUFDQSxPQUFBO0lBQ0EsV0FBQTtJQUNBLE9BQUE7RUE4T0Q7O0VBM09EO0lBQ0UsYUFBQTtFQThPRDs7RUEzT0Q7SUFDRSxnQkFBQTtJQUNBLGVBQUE7RUE4T0Q7O0VBM09EO0lBQ0UsZ0JBQUE7SUFDQSxlQUFBO0VBOE9EOztFQTNPRDtJQUNFLGlCQUFBO0VBOE9EOztFQTNPRDtJQUNFLGVBQUE7SUFDQSxZQUFBO0VBOE9EOztFQTNPRDtJQUNFLGFBQUE7RUE4T0Q7O0VBM09EO0lBQ0UsV0FBQTtFQThPRDs7RUEzT0Q7SUFDRSxjQUFBO0VBOE9EOztFQTVPRDtJQUNFLGVBQUE7RUErT0Q7O0VBN09EO0lBQ0UsYUFBQTtFQWdQRDs7RUE5T0Q7SUFDRSxlQUFBO0VBaVBEOztFQS9PQTtJQUNFLGVBQUE7SUFDQSxRQUFBO0lBQ0EsUUFBQTtFQWtQRjs7RUFoUEY7SUFDRSxVQUFBO0VBbVBBOztFQWpQRjtJQUNFLGVBQUE7RUFvUEE7O0VBbFBGO0lBQ0UsV0FBQTtFQXFQQTs7RUFuUEY7SUFDRSxlQUFBO0VBc1BBOztFQXBQRjtJQUNFLFlBQUE7RUF1UEE7O0VBclBGO0lBQ0UsZUFBQTtFQXdQQTs7RUF0UEY7SUFDRSxXQUFBO0lBQ0UsZUFBQTtJQUNBLGFBQUE7RUF5UEY7O0VBdlBGO0lBQ0UsZ0JBQUE7SUFDQSxrQkFBQTtJQUNBLGNBQUE7RUEwUEE7O0VBeFBGO0lBQ0UsZ0JBQUE7RUEyUEE7O0VBelBGO0lBQ0UsY0FBQTtJQUNBLGtCQUFBO0lBQ0EsZ0JBQUE7RUE0UEE7O0VBMVBGO0lBQ0UsZUFBQTtFQTZQQTs7RUEzUEY7SUFDRSxlQUFBO0lBQ0EsVUFBQTtFQThQQTs7RUE1UEY7SUFDRSxlQUFBO0VBK1BBOztFQTVQRjtJQUNFLGVBQUE7RUErUEE7O0VBN1BGO0lBQ0UsYUFBQTtFQWdRQTs7RUE5UEY7SUFDRSxlQUFBO0VBaVFBOztFQTlQRjtJQUNFLFlBQUE7SUFDRSxlQUFBO0lBQ0EsaUJBQUE7RUFpUUY7O0VBL1BGO0lBQ0UsZUFBQTtFQWtRQTs7RUFoUUY7SUFDRSxVQUFBO0VBbVFBOztFQWpRRjtJQUNFLGVBQUE7RUFvUUE7O0VBbFFGO0lBQ0UsZUFBQTtJQUNBLE9BQUE7RUFxUUE7O0VBblFGO0lBQ0UsZUFBQTtFQXNRQTs7RUFwUUY7SUFDRSxlQUFBO0VBdVFBOztFQXJRRjtJQUNFLGVBQUE7RUF3UUE7O0VBdFFGO0lBQ0UsZUFBQTtFQXlRQTs7RUF2UUY7SUFDRSxZQUFBO0VBMFFBOztFQXhRRjtJQUNFLFlBQUE7RUEyUUE7QUFDRlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIkbm90eS1wcmltYXJ5LWNvbG9yOiAjMzMzO1xcbiRub3R5LWRlZmF1bHQtd2lkdGg6IDMyNXB4O1xcbiRub3R5LWNvcm5lci1zcGFjZTogMjBweDtcXG5cXG4ubm90eV9sYXlvdXRfbWl4aW4ge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIHotaW5kZXg6IDk5OTk5OTk7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVooMCkgc2NhbGUoMS4wLCAxLjApO1xcbiAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgLXdlYmtpdC1mb250LXNtb290aGluZzogc3VicGl4ZWwtYW50aWFsaWFzZWQ7XFxuICBmaWx0ZXI6IGJsdXIoMCk7XFxuICAtd2Via2l0LWZpbHRlcjogYmx1cigwKTtcXG4gIG1heC13aWR0aDogOTAlO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX3RvcCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDUlO1xcbiAgd2lkdGg6IDkwJTtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3BMZWZ0IHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgdG9wOiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICBsZWZ0OiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X190b3BDZW50ZXIge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6IDUlO1xcbiAgbGVmdDogNTAlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZShjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLjAsIDEuMCk7XFxufVxcblxcbiNub3R5X2xheW91dF9fdG9wUmlnaHQge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6ICRub3R5LWNvcm5lci1zcGFjZTtcXG4gIHJpZ2h0OiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG59XFxuXFxuI25vdHlfbGF5b3V0X19ib3R0b20ge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICBib3R0b206IDA7XFxuICBsZWZ0OiA1JTtcXG4gIHdpZHRoOiA5MCU7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tTGVmdCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIGJvdHRvbTogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgbGVmdDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxufVxcblxcbiNub3R5X2xheW91dF9fYm90dG9tQ2VudGVyIHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgYm90dG9tOiA1JTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAkbm90eS1kZWZhdWx0LXdpZHRoO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoY2FsYygtNTAlIC0gLjVweCkpIHRyYW5zbGF0ZVooMCkgc2NhbGUoMS4wLCAxLjApO1xcbn1cXG5cXG4jbm90eV9sYXlvdXRfX2JvdHRvbVJpZ2h0IHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgYm90dG9tOiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICByaWdodDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyIHtcXG4gIEBleHRlbmQgLm5vdHlfbGF5b3V0X21peGluO1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKGNhbGMoLTUwJSAtIC41cHgpLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLjAsIDEuMCk7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyTGVmdCB7XFxuICBAZXh0ZW5kIC5ub3R5X2xheW91dF9taXhpbjtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogJG5vdHktY29ybmVyLXNwYWNlO1xcbiAgd2lkdGg6ICRub3R5LWRlZmF1bHQtd2lkdGg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCBjYWxjKC01MCUgLSAuNXB4KSkgdHJhbnNsYXRlWigwKSBzY2FsZSgxLjAsIDEuMCk7XFxufVxcblxcbiNub3R5X2xheW91dF9fY2VudGVyUmlnaHQge1xcbiAgQGV4dGVuZCAubm90eV9sYXlvdXRfbWl4aW47XFxuICB0b3A6IDUwJTtcXG4gIHJpZ2h0OiAkbm90eS1jb3JuZXItc3BhY2U7XFxuICB3aWR0aDogJG5vdHktZGVmYXVsdC13aWR0aDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIGNhbGMoLTUwJSAtIC41cHgpKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEsIDEpO1xcbn1cXG5cXG4ubm90eV9wcm9ncmVzc2JhciB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4ubm90eV9oYXNfdGltZW91dC5ub3R5X2hhc19wcm9ncmVzc2JhciAubm90eV9wcm9ncmVzc2JhciB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDA7XFxuICBib3R0b206IDA7XFxuICBoZWlnaHQ6IDNweDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzY0NjQ2NDtcXG4gIG9wYWNpdHk6IDAuMjtcXG4gIGZpbHRlcjogYWxwaGEob3BhY2l0eT0xMClcXG59XFxuXFxuLm5vdHlfYmFyIHtcXG4gIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKSB0cmFuc2xhdGVaKDApIHNjYWxlKDEuMCwgMS4wKTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApIHNjYWxlKDEuMCwgMS4wKTtcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IHN1YnBpeGVsLWFudGlhbGlhc2VkO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLm5vdHlfZWZmZWN0c19vcGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUpO1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1faW4gLjVzIGN1YmljLWJlemllcigwLjY4LCAtMC41NSwgMC4yNjUsIDEuNTUpO1xcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7XFxufVxcblxcbi5ub3R5X2VmZmVjdHNfY2xvc2Uge1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1fb3V0IC41cyBjdWJpYy1iZXppZXIoMC42OCwgLTAuNTUsIDAuMjY1LCAxLjU1KTtcXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGZvcndhcmRzO1xcbn1cXG5cXG4ubm90eV9maXhfZWZmZWN0c19oZWlnaHQge1xcbiAgYW5pbWF0aW9uOiBub3R5X2FuaW1faGVpZ2h0IDc1bXMgZWFzZS1vdXQ7XFxufVxcblxcbi5ub3R5X2Nsb3NlX3dpdGhfY2xpY2sge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubm90eV9jbG9zZV9idXR0b24ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAycHg7XFxuICByaWdodDogMnB4O1xcbiAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAyMHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAuMDUpO1xcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4ycyBlYXNlLW91dDtcXG59XFxuXFxuLm5vdHlfY2xvc2VfYnV0dG9uOmhvdmVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgLjEpO1xcbn1cXG5cXG4ubm90eV9tb2RhbCB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICB6LWluZGV4OiAxMDAwMDtcXG4gIG9wYWNpdHk6IC4zO1xcbiAgbGVmdDogMDtcXG4gIHRvcDogMDtcXG59XFxuXFxuLm5vdHlfbW9kYWwubm90eV9tb2RhbF9vcGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxuICBhbmltYXRpb246IG5vdHlfbW9kYWxfaW4gLjNzIGVhc2Utb3V0O1xcbn1cXG4ubm90eV9tb2RhbC5ub3R5X21vZGFsX2Nsb3NlIHtcXG4gIGFuaW1hdGlvbjogbm90eV9tb2RhbF9vdXQgLjNzIGVhc2Utb3V0O1xcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9pbiB7XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogLjM7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9vdXQge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9tb2RhbF9vdXQge1xcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbm90eV9hbmltX2luIHtcXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKTtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBub3R5X2FuaW1fb3V0IHtcXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUpO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG5vdHlfYW5pbV9oZWlnaHQge1xcbiAgMTAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gIH1cXG59XFxuXFxuLy9AaW1wb3J0IFxcXCJ0aGVtZXMvcmVsYXhcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL21ldHJvdWlcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL21pbnRcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL3N1bnNldFxcXCI7XFxuLy9AaW1wb3J0IFxcXCJ0aGVtZXMvYm9vdHN0cmFwLXYzXFxcIjtcXG4vL0BpbXBvcnQgXFxcInRoZW1lcy9ib290c3RyYXAtdjRcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL3NlbWFudGljdWlcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL25lc3RcXFwiO1xcbi8vQGltcG9ydCBcXFwidGhlbWVzL2xpZ2h0XFxcIjtcXG5cIixcIkBpbXBvcnQgJy4vdmFyaWFibGVzJztcXHJcXG5AaW1wb3J0ICd+bm90eS9zcmMvbm90eS5zY3NzJztcXHJcXG5AaW1wb3J0ICd+bm90eS9zcmMvdGhlbWVzL21pbnQuc2Nzcyc7XFxyXFxuKiB7XFxyXFxuICBtYXJnaW46IDA7XFxyXFxufVxcclxcblxcclxcbmh0bWwsXFxyXFxuYm9keSB7XFxyXFxuICBoZWlnaHQ6IDEwMCU7XFxyXFxuICB3aWR0aDogMTAwJTtcXHJcXG59XFxyXFxuXFxyXFxuYnV0dG9uOmZvY3Vze1xcclxcbiAgb3V0bGluZTpub25lO1xcclxcbn1cXHJcXG5cXHJcXG5ib2R5IHtcXHJcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGF0b1xcXCIsIFxcXCJzYW5zLXNlcmlmXFxcIjtcXHJcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxuICB3aWR0aCA6IDEwMCU7XFxyXFxufVxcclxcblxcclxcbm5hdiB7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICBtaW4taGVpZ2h0OiAxMjBweDtcXHJcXG59XFxyXFxuXFxyXFxuLm5hdi13cmFwcGVyIHtcXHJcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXHJcXG4gIHBhZGRpbmc6IDEwcHg7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICB0b3A6IDIwJTtcXHJcXG4gIHJpZ2h0OiAxJTtcXHJcXG59XFxyXFxuXFxyXFxuLm5hdi13cmFwcGVyIHVsIGxpIHtcXHJcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXHJcXG4gIG1hcmdpbjogMCAxMHB4O1xcclxcbiAgcGFkZGluZzogNXB4O1xcclxcbiAgZm9udC1zaXplOiAxOHB4O1xcclxcbn1cXHJcXG5cXHJcXG4ubmF2LXdyYXBwZXIgdWwgbGk6bGFzdC1jaGlsZHtcXHJcXG5wb3NpdGlvbjpyZWxhdGl2ZTtcXHJcXG59XFxyXFxuXFxyXFxuLnRvdGFsLWNvdW50ZXIge1xcclxcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICAgIGJhY2tncm91bmQ6IHJnYmEoMTAwLDE2MCwyNTUsMSk7XFxyXFxuICAgIGNvbG9yOiB3aGl0ZTtcXHJcXG4gICAgd2lkdGg6IDIwcHg7XFxyXFxuICAgIGhlaWdodDogMjBweDtcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcclxcbiAgICBwYWRkaW5nOiAycHggMHB4IDAgNnB4O1xcclxcbiAgICBmb250LXNpemU6IDEzcHg7XFxyXFxuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xcclxcbiAgICB0b3A6IC0xMCU7XFxyXFxuICAgIHJpZ2h0OiAtMjAlO1xcclxcbn1cXHJcXG5cXHJcXG4ubmF2LXdyYXBwZXIgdWwgbGkgYSB7XFxyXFxuICBjb2xvcjogI0ZFNUYxRTtcXHJcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXHJcXG59XFxyXFxuXFxyXFxuLmNhcnQge1xcclxcbiAgd2lkdGg6IDQ0cHg7XFxyXFxuICBoZWlnaHQ6IDMwcHg7XFxyXFxufVxcclxcblxcclxcbi5sb2dvLXdyYXBwZXIge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiA1JTtcXHJcXG4gIGxlZnQ6IDAlO1xcclxcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nby13cmFwcGVyIGltZyB7XFxyXFxuICB3aWR0aDogMTUwcHg7XFxyXFxuICBoZWlnaHQ6IDEyMHB4O1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nby13cmFwcGVyIHNwYW4ge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiA0MCU7XFxyXFxuICBsZWZ0OiAxMDAlO1xcclxcbiAgbGV0dGVyLXNwYWNpbmc6IDZweDtcXHJcXG4gIGNvbG9yOiAjRkU1RjFFO1xcclxcbiAgZm9udC1zaXplOiAyM3B4O1xcclxcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXHJcXG59XFxyXFxuXFxyXFxuLmludHJvLWNvbnRhaW5lciB7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICBoZWlnaHQ6IDgwJTtcXHJcXG4gIHdpZHRoOiAxMDAlO1xcclxcbiAgYmFja2dyb3VuZDogI2Y4ZjhmODtcXHJcXG4gIGxlZnQ6IDA7XFxyXFxufVxcclxcblxcclxcbi5iYW5uZXIge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgcmlnaHQ6IDAlO1xcclxcbiAgdG9wOiAxNCU7XFxyXFxuICB3aWR0aDogMzQlO1xcclxcbiAgaGVpZ2h0OiA3OSU7XFxyXFxufVxcclxcblxcclxcbi5jYXB0aW9uIHtcXHJcXG4gIGZvbnQtc2l6ZTogMjBweDtcXHJcXG4gIGxldHRlci1zcGFjaW5nOiAycHg7XFxyXFxuICBwYWRkaW5nOiAxMHB4O1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiA0MCU7XFxyXFxuICBsZWZ0OiA1JTtcXHJcXG59XFxyXFxuXFxyXFxuLmNhcHRpb24gaDEge1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxuICBmb250LXNpemU6IDUwcHg7XFxyXFxuICBsZXR0ZXItc3BhY2luZzogNnB4O1xcclxcbiAgbWFyZ2luOiAyMHB4IDA7XFxyXFxufVxcclxcblxcclxcbi5vcmRlciB7XFxyXFxuICBiYWNrZ3JvdW5kOiAjRkU1RjFFO1xcclxcbiAgY29sb3I6ICNmZmY7XFxyXFxuICBwYWRkaW5nOiA3cHg7XFxyXFxuICBib3JkZXI6IDFweCB3aGl0ZSBzb2xpZDtcXHJcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXHJcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXHJcXG4gIHdpZHRoOiA2MCU7XFxyXFxuICBkaXNwbGF5OiBibG9jaztcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyOmhvdmVyIHtcXHJcXG5iYWNrZ3JvdW5kLWNvbG9yOiRkYXJrO1xcclxcbmNvbG9yOiRwdXJlO1xcclxcblxcclxcbn1cXHJcXG5cXHJcXG4ubmF2LXdyYXBwZXIgdWwgbGkgYTpob3ZlciB7XFxyXFxuICBjb2xvcjogIzIzMjMyMztcXHJcXG59XFxyXFxuXFxyXFxuLm1lbnUtY29udGFpbmVyIHtcXHJcXG4gIGhlaWdodDogMTAwJTtcXHJcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXHJcXG4gIHdpZHRoOiAxMDAlO1xcclxcbn1cXHJcXG5cXHJcXG4ubWVudS1jb250YWluZXIgaDIge1xcclxcbiAgZm9udC1zaXplOiAzMHB4O1xcclxcbiAgbWFyZ2luOiAzMHB4O1xcclxcbiAgZm9udC13ZWlnaHQ6Ym9sZDtcXHJcXG4gIGNvbG9yOiRwcmltYXJ5O1xcclxcbiAgbGV0dGVyLXNwYWNpbmc6IDVweDtcXHJcXG59XFxyXFxuXFxyXFxuLm1lbnUtaXRlbSBpbWcge1xcclxcbiAgd2lkdGg6IDUwJTtcXHJcXG4gIGhlaWdodDogNTAlO1xcclxcbiAgZGlzcGxheTogYmxvY2s7XFxyXFxuICBtYXJnaW46IGF1dG87XFxyXFxufVxcclxcblxcclxcbi5tZW51LWl0ZW0gLml0ZW0tbmFtZSB7XFxyXFxuICBkaXNwbGF5OiBibG9jaztcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIGZvbnQtd2VpZ2h0OjcwMDtcXHJcXG4gIGxldHRlci1zcGFjaW5nOiAycHg7XFxyXFxuICBmb250LXNpemU6IDE4cHg7XFxyXFxuICBjb2xvcjogIzIzMjMyMztcXHJcXG4gIG1hcmdpbjogNXB4IDA7XFxyXFxufVxcclxcblxcclxcbi5tZW51LWl0ZW0gLml0ZW0tcHJpY2Uge1xcclxcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcclxcbiAgd2lkdGg6IDQwJTtcXHJcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxyXFxuICBwYWRkaW5nOiA1cHg7XFxyXFxuICBwYWRkaW5nLWxlZnQ6IDIwcHg7XFxyXFxuICBmb250LXdlaWdodDogNTAwO1xcclxcbiAgY29sb3I6ICMyMzIzMjM7XFxyXFxufVxcclxcblxcclxcbi5tZW51LWl0ZW0gYnV0dG9uIHtcXHJcXG4gIGJhY2tncm91bmQ6ICNGRTVGMUU7XFxyXFxuICBjb2xvcjogI2ZmZjtcXHJcXG4gIHdvcmQtc3BhY2luZzogMTBweDtcXHJcXG4gIHBhZGRpbmc6IDVweDtcXHJcXG4gIGJvcmRlcjogMXB4IHdoaXRlIHNvbGlkO1xcclxcbiAgYm9yZGVyLXJhZGl1czogNXB4O1xcclxcbiAgbWFyZ2luLWxlZnQ6IDMwcHg7XFxyXFxufVxcclxcblxcclxcblxcclxcbi5tZW51LWl0ZW0gYnV0dG9uOmZvY3Vze1xcclxcbiAgb3V0bGluZSA6IG5vbmU7XFxyXFxufVxcclxcblxcclxcbi5jYXJ0LWVtcHR5IGgxLCAuY2FydC1ub25lbXB0eSBoMXtcXHJcXG4gIGNvbG9yOiRkYXJrO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXdlaWdodDo3MDA7XFxyXFxuICBmb250LXNpemU6MzBweDtcXHJcXG4gIG1hcmdpbjoyMHB4IDA7XFxyXFxuICBsZXR0ZXItc3BhY2luZzogM3B4O1xcclxcbn1cXHJcXG5cXHJcXG4uY2FydC1lbXB0eSBwe1xcclxcbiAgZm9udC1zaXplOjIwcHg7XFxyXFxuICBtYXJnaW46YXV0bztcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbiAgcGFkZGluZzo1cHg7XFxyXFxufVxcclxcblxcclxcbi5pbWctd3JhcHBlcntcXHJcXG4gIHdpZHRoOjQwJTtcXHJcXG4gIG1hcmdpbjphdXRvO1xcclxcbn1cXHJcXG5cXHJcXG4uaW1nLXdyYXBwZXIgaW1ne1xcclxcbiAgd2lkdGg6MTAwJTtcXHJcXG4gIGhlaWdodDoxMDAlO1xcclxcbn1cXHJcXG5cXHJcXG4uY2FydC1lbXB0eSBhe1xcclxcbiAgYmFja2dyb3VuZDogI0ZFNUYxRTtcXHJcXG4gIGNvbG9yOiAjZmZmO1xcclxcbiAgcGFkZGluZzogN3B4O1xcclxcbiAgYm9yZGVyOiAxcHggd2hpdGUgc29saWQ7XFxyXFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxyXFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxyXFxuICB3aWR0aDogMTAwcHg7XFxyXFxuICBtYXJnaW46MTBweCBhdXRvO1xcclxcbiAgZGlzcGxheTogYmxvY2s7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxufVxcclxcblxcclxcbi5jYXJ0LWVtcHR5IGE6aG92ZXIge1xcclxcbmJhY2tncm91bmQtY29sb3I6JGRhcms7XFxyXFxuY29sb3I6JHB1cmU7XFxyXFxufVxcclxcblxcclxcbi5jYXJ0LW5vbmVtcHR5e1xcclxcbiAgYmFja2dyb3VuZDokc2Vjb25kYXJ5O1xcclxcbiAgbWluLWhlaWdodDoxMDAlO1xcclxcbn1cXHJcXG5cXHJcXG4uY291bnRlci1jb250YWluZXJ7XFxyXFxuICB3aWR0aDo3MCU7XFxyXFxuICBtYXJnaW46YXV0bztcXHJcXG59XFxyXFxuXFxyXFxuLmNhcnQtbm9uZW1wdHkgaDF7XFxyXFxuICBmb250LXNpemU6MjBweDtcXHJcXG4gIHBhZGRpbmc6MjBweDtcXHJcXG4gIHRleHQtYWxpZ246bGVmdDtcXHJcXG4gIGxldHRlci1zcGFjaW5nOjJweDtcXHJcXG59XFxyXFxuXFxyXFxuLmNvdW50ZXJ7XFxyXFxucGFkZGluZy1ib3R0b206MTVweDtcXHJcXG5ib3JkZXItYm90dG9tOjFweCAkZ3JheSBzb2xpZDtcXHJcXG59XFxyXFxuXFxyXFxuXFxyXFxuLnBpenphLWRpc3BsYXkgaW1ne1xcclxcbndpZHRoOjMwJTtcXHJcXG5kaXNwbGF5OmJsb2NrO1xcclxcbm1hcmdpbjphdXRvO1xcclxcbn1cXHJcXG5cXHJcXG4ucGl6emEtbmFtZXtcXHJcXG4gIGRpc3BsYXk6YmxvY2s7XFxyXFxuICB3aWR0aDoxMDAlO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXNpemU6MThweDtcXHJcXG4gIGNvbG9yOiRwcmltYXJ5O1xcclxcbn1cXHJcXG5cXHJcXG4ucGl6emEtc2l6ZXtcXHJcXG4gIGRpc3BsYXk6YmxvY2s7XFxyXFxuICB3aWR0aDoxMDAlO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXNpemU6MTZweDtcXHJcXG4gIGNvbG9yOiRncmF5O1xcclxcbn1cXHJcXG5cXHJcXG4ucGl6emEtcHJpY2UsIC5waXp6YS1udW1iZXJ7XFxyXFxuICBkaXNwbGF5OmJsb2NrO1xcclxcbiAgd2lkdGg6MTAwJTtcXHJcXG4gIGFsaWduLXNlbGY6Y2VudGVyO1xcclxcbiAgdGV4dC1hbGlnbjpjZW50ZXI7XFxyXFxuICBmb250LXNpemU6MThweDtcXHJcXG4gIGNvbG9yOiRkYXJrO1xcclxcbn1cXHJcXG5cXHJcXG4udG90YWx7XFxyXFxuICBwYWRkaW5nOjIwcHg7XFxyXFxuICAgdGV4dC1hbGlnbjpyaWdodDtcXHJcXG59XFxyXFxuXFxyXFxuLnRvdGFsIHNwYW57XFxyXFxuIGNvbG9yOiRwcmltYXJ5O1xcclxcbiBwYWRkaW5nOjAgNXB4O1xcclxcbn1cXHJcXG5cXHJcXG4uYWRkcmVzc3tcXHJcXG4gIG1hcmdpbjoxMHB4IDA7XFxyXFxuICB0ZXh0LWFsaWduOnJpZ2h0O1xcclxcbiAgcG9zaXRpb246cmVsYXRpdmU7XFxyXFxufVxcclxcblxcclxcbi5hZGRyZXNzIGlucHV0e1xcclxcbiAgd2lkdGg6NDAlO1xcclxcbiAgaGVpZ2h0OjIwcHg7XFxyXFxuICBwb3NpdGlvbjphYnNvbHV0ZTtcXHJcXG4gIHBhZGRpbmc6MTBweDtcXHJcXG4gIHJpZ2h0OjA7XFxyXFxuICBib3JkZXI6MXB4ICRncmF5IHNvbGlkO1xcclxcbiAgYm9yZGVyLXJhZGl1czoxcHg7XFxyXFxufVxcclxcblxcclxcbi5hZGRyZXNzIGJ1dHRvbntcXHJcXG4gIGJhY2tncm91bmQ6JHByaW1hcnk7XFxyXFxuICBjb2xvcjokcHVyZTtcXHJcXG4gIGJvcmRlci1yYWRpdXM6MTBweDtcXHJcXG4gIHBhZGRpbmc6N3B4O1xcclxcbiAgZm9udC1zaXplOjE1cHg7XFxyXFxuICBib3JkZXI6MXB4ICRncmF5IHNvbGlkO1xcclxcbiAgcG9zaXRpb246YWJzb2x1dGU7XFxyXFxuICB0b3A6NDBweDtcXHJcXG4gIHJpZ2h0OjA7XFxyXFxufVxcclxcblxcclxcbi8vbG9naW4gYW5kIHJlZ2lzdHJhdGlvblxcclxcblxcclxcbi5sb2dpbi1jb250YWluZXIsIC5yZWdpc3Rlci1jb250YWluZXJ7XFxyXFxuICBiYWNrZ3JvdW5kOiRzZWNvbmRhcnk7XFxyXFxufVxcclxcblxcclxcbi5sb2dpbi1jb250YWluZXIgaW5wdXQsIC5yZWdpc3Rlci1jb250YWluZXIgaW5wdXR7XFxyXFxuICBtYXJnaW46MjBweCBhdXRvO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9naW4tYnV0dG9ue1xcclxcbiAgYmFja2dyb3VuZDokcHJpbWFyeTtcXHJcXG4gIGNvbG9yOiRwdXJlO1xcclxcbiAgZm9udC1zaXplOjE2cHg7XFxyXFxuICBwYWRkaW5nOjEwcHg7XFxyXFxuICBib3JkZXItcmFkaXVzOjEwcHg7XFxyXFxuICBib3JkZXI6MXB4ICRncmF5IHNvbGlkO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9naW4tYnV0dG9uOmhvdmVye1xcclxcbiAgYmFja2dyb3VuZCA6IGJsYWNrO1xcclxcbn1cXHJcXG4uZm9yZ290LXB3e1xcclxcbiAgY29sb3I6JHByaW1hcnk7XFxyXFxuICBmb250LXdlaWdodDo3MDA7XFxyXFxufVxcclxcblxcclxcbi5mb3Jnb3QtcHc6aG92ZXJ7XFxyXFxuICBjb2xvcjokZGFyaztcXHJcXG59XFxyXFxuXFxyXFxuLmF1dGgtZXJyb3J7XFxyXFxuICBjb2xvcjpyZWQ7XFxyXFxuICBmb250LXNpemU6MTRweDtcXHJcXG4gIHBhZGRpbmc6MTBweDtcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nZ2VkLWluLW5hbWV7XFxyXFxuICBmb250LXNpemU6IDE2cHg7XFxyXFxuZm9udC13ZWlnaHQ6IDUwMTtcXHJcXG5wb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxudG9wOiAxMCU7XFxyXFxucmlnaHQ6IDklO1xcclxcbmNvbG9yOiBvcmFuZ2U7XFxyXFxufVxcclxcblxcclxcbi5ub3QtbG9nZ2VkLWluLW1zZ3tcXHJcXG4gIGNvbG9yIDogcmVkO1xcclxcbiAgZm9udC13ZWlnaHQgOiA2MDA7XFxyXFxuICBmb250LXNpemU6MTZweDtcXHJcXG4gIHBhZGRpbmc6MTBweDtcXHJcXG4gIHRleHQtYWxpZ246Y2VudGVyO1xcclxcbn1cXHJcXG5cXHJcXG4ubm90LWxvZ2dlZC1pbi1tc2cgYXtcXHJcXG4gIGNvbG9yOiBibHVlO1xcclxcbiAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxyXFxuICBkaXNwbGF5IDogaW5saW5lLWJsb2NrO1xcclxcbiAgcGFkZGluZzogMCA1cHg7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci10aGVhZHtcXHJcXG4gIHBhZGRpbmcgOiA1cHg7XFxyXFxuICBib3JkZXIgOiAxcHggc29saWQgZ3JheTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLXRoZWFkIGRpdntcXHJcXG4gIGJvcmRlci1sZWZ0IDogMXB4IHNvbGlkIGdyYXk7XFxyXFxuICB0ZXh0LWFsaWduIDogY2VudGVyO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItcm93e1xcclxcbiAgcGFkZGluZyA6IDVweDtcXHJcXG4gIHRyYW5zaXRpb246IGFsbCAzcyBlYXNlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItcm93IGRpdntcXHJcXG4gIHRleHQtYWxpZ24gOiBjZW50ZXI7XFxyXFxuICBwYWRkaW5nIDogM3B4O1xcclxcbiAgYm9yZGVyLWxlZnQgOiAxcHggc29saWQgZ3JheTtcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCBncmF5O1xcclxcbn1cXHJcXG5cXHJcXG5Aa2V5ZnJhbWVzIHNoYWtle1xcclxcbiAgMzMle1xcclxcbiAgICB0cmFuc2Zvcm0gOiByb3RhdGUoNTBkZWcpXFxyXFxuICB9XFxyXFxuXFxyXFxuICA2NiV7XFxyXFxuICAgIHRyYW5zZm9ybTogcm90YXRlKC01MGRlZylcXHJcXG4gIH1cXHJcXG59XFxyXFxuXFxyXFxuLnRyYWNrLWNvbnRhaW5lcntcXHJcXG4gIGJhY2tncm91bmQgOiAjZjhmOGY4O1xcclxcbiAgd2lkdGggOiAxMDAlO1xcclxcbiAgaGVpZ2h0IDogNjAwcHg7XFxyXFxufVxcclxcblxcclxcbi50cmFja2luZy1zZWN0aW9ue1xcclxcbiAgd2lkdGggOiA3MCU7XFxyXFxuICBtYXJnaW4gOiAyMHB4IGF1dG87XFxyXFxuICBwYWRkaW5nLXRvcCA6IDEwMHB4O1xcclxcbiAgaGVpZ2h0IDogNTAwcHg7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1pbmZve1xcclxcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItaW5mbyBoMXtcXHJcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxyXFxucG9zaXRpb246IGFic29sdXRlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItaW5mbyAub3JkZXItaWR7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICAgIHJpZ2h0OiAwO1xcclxcbiAgICBjb2xvcjogb3JhbmdlO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXItc3RhdHVzIHtcXHJcXG4gIG1hcmdpbiA6IDUwcHg7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICBsZWZ0OiAxOCU7XFxyXFxuICB0b3AgOiAzJTtcXHJcXG59XFxyXFxuXFxyXFxuLm9yZGVyLXN0YXR1cyBsaXtcXHJcXG4gIG1hcmdpbjogNTBweDtcXHJcXG4gIHdpZHRoIDogMzAwcHg7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXHJcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcclxcbiAgICBsZXR0ZXItc3BhY2luZzogMS41cHg7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1zdGF0dXMgbGkgLmljb257XFxyXFxuICBmb250LXNpemU6IDMwcHg7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICByaWdodDogMDtcXHJcXG4gIHRvcCA6IC01cHg7XFxyXFxuICB0cmFuc2l0aW9uIDogdHJhbnNmb3JtIDJzIGVhc2U7XFxyXFxuICB0cmFuc2Zvcm0gOiBzY2FsZSgxLjIpO1xcclxcbn1cXHJcXG5cXHJcXG4ub3JkZXJzLXNtYWxse1xcclxcbiAgZGlzcGxheSA6IG5vbmU7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1zdGF0dXMgbGk6YmVmb3Jle1xcclxcbiAgY29udGVudCA6ICcnO1xcclxcbiAgYmFja2dyb3VuZCA6IGJsYWNrO1xcclxcbiAgYm9yZGVyLXJhZGl1cyA6IDUwJTtcXHJcXG4gIHdpZHRoIDogMTBweDtcXHJcXG4gIGhlaWdodCA6IDEwcHg7XFxyXFxuICByaWdodCA6IDg4cHg7XFxyXFxuICB0b3AgOiA3cHg7XFxyXFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxufVxcclxcblxcclxcbi5vcmRlci1zdGF0dXMgbGk6YWZ0ZXJ7XFxyXFxuICBjb250ZW50OiBcXFwiXFxcIjtcXHJcXG4gICAgYmFja2dyb3VuZDogYmxhY2s7XFxyXFxuICAgIHdpZHRoOiAycHg7XFxyXFxuICAgIGhlaWdodDogMTg4JTtcXHJcXG4gICAgbWFyZ2luLXRvcDogMTVweDtcXHJcXG4gICAgcmlnaHQ6IDkycHg7XFxyXFxuICAgIHRvcDogMTBweDtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbn1cXHJcXG5cXHJcXG5cXHJcXG5AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoIDogNjUwcHgpIHtcXHJcXG4gIC5tZW51LWl0ZW0gLml0ZW0tcHJpY2V7XFxyXFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIH1cXHJcXG4gIC5iYW5uZXIge1xcclxcbiAgICByaWdodDogMSU7XFxyXFxuICAgdG9wOiA0MSU7XFxyXFxuICAgd2lkdGg6IDQzJTtcXHJcXG4gICBoZWlnaHQ6IDE4MHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1zdGF0dXN7XFxyXFxuICAgbWFyZ2luIDogMDtcXHJcXG4gICBsZWZ0IDogMDtcXHJcXG4gICB3aWR0aCA6IDEwMCU7XFxyXFxuICAgdG9wIDogNSU7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLm9yZGVyLWluZm97XFxyXFxuICAgcGFkZGluZyA6IDEwcHg7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLm9yZGVyLWluZm8gaDF7XFxyXFxuICAgcG9zaXRpb246IHN0YXRpYztcXHJcXG4gICBmb250LXNpemUgOiAxNHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1pbmZvIC5vcmRlci1pZHtcXHJcXG4gICBwb3NpdGlvbjogc3RhdGljO1xcclxcbiAgIGZvbnQtc2l6ZSA6IDEzcHg7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLnRyYWNraW5nLXNlY3Rpb257XFxyXFxuICAgcGFkZGluZy10b3AgOiAzNnB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlci1zdGF0dXMgbGkge1xcclxcbiAgIGZvbnQtc2l6ZTogMTNweDtcXHJcXG4gICBtYXJnaW4gOiAzMHB4O1xcclxcbiB9XFxyXFxuXFxyXFxuIC50cmFja2luZy1jb250YWluZXJ7XFxyXFxuICAgaGVpZ2h0IDogNDUwcHg7XFxyXFxuIH1cXHJcXG5cXHJcXG4gLnRyYWNraW5nLXNlY3Rpb257XFxyXFxuICAgd2lkdGggOiAxMDAlO1xcclxcbiB9XFxyXFxuXFxyXFxuIC5vcmRlcnMtc21hbGx7XFxyXFxuICAgZGlzcGxheTogYmxvY2s7XFxyXFxuIH1cXHJcXG4gLnN1Y2Nlc3MtYWxlcnR7XFxyXFxuICAgZm9udC1zaXplOiAxNHB4O1xcclxcbiB9XFxyXFxuIC5vcmRlcnN7XFxyXFxuICAgZGlzcGxheSA6IG5vbmU7XFxyXFxuIH1cXHJcXG4gLmF1dGgtZXJyb3J7XFxyXFxuICAgZm9udC1zaXplOiAxM3B4O1xcclxcbiB9XFxyXFxuICAuY2FwdGlvbntcXHJcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcclxcbiAgICB0b3A6IDE3JTtcXHJcXG4gICAgbGVmdDogNCU7XFxyXFxufVxcclxcbi5vcmRlcntcXHJcXG4gIHdpZHRoIDogNTAlO1xcclxcbn1cXHJcXG4uY2FwdGlvbiBoMXtcXHJcXG4gIGZvbnQtc2l6ZSA6IDM1cHg7XFxyXFxufVxcclxcbi5pbnRyby1jb250YWluZXJ7XFxyXFxuICBoZWlnaHQgOiA1MCU7XFxyXFxufVxcclxcbi5tZW51LWNvbnRhaW5lciBoMntcXHJcXG4gIGZvbnQtc2l6ZSA6IDIwcHg7XFxyXFxufVxcclxcbi5tZW51LWl0ZW0gaW1ne1xcclxcbiAgaGVpZ2h0IDogOTBweDtcXHJcXG59XFxyXFxuLm1lbnUtaXRlbSAuaXRlbS1uYW1le1xcclxcbiAgZm9udC1zaXplIDogMTRweDtcXHJcXG59XFxyXFxuLmxvZ28td3JhcHBlciBpbWd7XFxyXFxuICBtYXJnaW46IDVweDtcXHJcXG4gICAgZGlzcGxheTogaW5saW5lO1xcclxcbiAgICBoZWlnaHQ6IDEwMHB4O1xcclxcbn1cXHJcXG4ubG9nby13cmFwcGVye1xcclxcbiAgcG9zaXRpb24gOiBzdGF0aWM7XFxyXFxuICB0ZXh0LWFsaWduIDogY2VudGVyO1xcclxcbiAgZGlzcGxheSA6IGJsb2NrO1xcclxcbn1cXHJcXG4ubG9nby13cmFwcGVyIHNwYW57XFxyXFxuICBwb3NpdGlvbjogc3RhdGljO1xcclxcbn1cXHJcXG4ubmF2LXdyYXBwZXJ7XFxyXFxuICBkaXNwbGF5OiBibG9jaztcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIHBvc2l0aW9uOiBzdGF0aWM7XFxyXFxufVxcclxcbi5jYXJ0LW5vbmVtcHR5IGgxe1xcclxcbiAgZm9udC1zaXplOiAxNnB4O1xcclxcbn1cXHJcXG4ubm90LWxvZ2dlZC1pbi1tc2d7XFxyXFxuICBmb250LXNpemU6IDE0cHg7XFxyXFxuICBwYWRkaW5nOiAwO1xcclxcbn1cXHJcXG4udG90YWx7XFxyXFxuICBmb250LXNpemU6IDE0cHg7XFxyXFxufVxcclxcblxcclxcbi5waXp6YS1uYW1lLCAucGl6emEtc2l6ZSwgLnBpenphLW51bWJlciwgLnBpenphLXByaWNle1xcclxcbiAgZm9udC1zaXplOiAxNHB4O1xcclxcbn1cXHJcXG4uY2FydC1ub25lbXB0eXtcXHJcXG4gIG1pbi1oZWlnaHQgOiAwO1xcclxcbn1cXHJcXG4uc2lnbi1pbi1tc2d7XFxyXFxuICBmb250LXNpemUgOiAxNnB4O1xcclxcbn1cXHJcXG5cXHJcXG4ubG9naW4tY29udGFpbmVyIGlucHV0LCAucmVnaXN0ZXItY29udGFpbmVyIGlucHV0e1xcclxcbiAgcGFkZGluZzogNXB4O1xcclxcbiAgICBmb250LXNpemU6IDEzcHg7XFxyXFxuICAgIG1hcmdpbjogMjBweCBhdXRvO1xcclxcbn1cXHJcXG4ubG9naW4tYnV0dG9ue1xcclxcbiAgZm9udC1zaXplIDogMTRweDtcXHJcXG59XFxyXFxuLmFkZHJlc3MgaW5wdXR7XFxyXFxuICB3aWR0aCA6IDgwJTtcXHJcXG59XFxyXFxuLmFkZHJlc3MgYnV0dG9ue1xcclxcbiAgZm9udC1zaXplOiAxM3B4O1xcclxcbn1cXHJcXG4ubG9nZ2VkLWluLW5hbWV7XFxyXFxuICBmb250LXNpemU6IDEzcHg7XFxyXFxuICB0b3A6IDUlO1xcclxcbn1cXHJcXG4uY2FydC1lbXB0eSBwe1xcclxcbiAgZm9udC1zaXplIDogMTRweDtcXHJcXG59XFxyXFxuLmNhcnQtZW1wdHkgaDF7XFxyXFxuICBmb250LXNpemU6IDIwcHg7XFxyXFxufVxcclxcbi5jYXJ0LWVtcHR5IGF7XFxyXFxuICBmb250LXNpemU6IDEzcHg7XFxyXFxufVxcclxcbi5mb3Jnb3QtcHd7XFxyXFxuICBmb250LXNpemU6IDE1cHg7XFxyXFxufVxcclxcbi50b3RhbC1jb3VudGVye1xcclxcbiAgcGFkZGluZyA6IDJweDtcXHJcXG59XFxyXFxuLm5hdi13cmFwcGVyIHVsIGxpe1xcclxcbiAgcGFkZGluZyA6IDFweDtcXHJcXG59XFxyXFxufVxcclxcblwiLFwiLm5vdHlfdGhlbWVfX21pbnQubm90eV9iYXIge1xcclxcbiAgbWFyZ2luOiA0cHggMDtcXHJcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxyXFxuICBib3JkZXItcmFkaXVzOiAycHg7XFxyXFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuXFxyXFxuICAubm90eV9ib2R5IHtcXHJcXG5cXHRwYWRkaW5nOiAxMHB4O1xcclxcblxcdGZvbnQtc2l6ZTogMTRweDtcXHJcXG4gIH1cXHJcXG5cXHJcXG4gIC5ub3R5X2J1dHRvbnMge1xcclxcblxcdHBhZGRpbmc6IDEwcHg7XFxyXFxuICB9XFxyXFxufVxcclxcblxcclxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fYWxlcnQsXFxyXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19ub3RpZmljYXRpb24ge1xcclxcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjRDFEMUQxO1xcclxcbiAgY29sb3I6ICMyRjJGMkY7XFxyXFxufVxcclxcblxcclxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fd2FybmluZyB7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZBRTQyO1xcclxcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNFODlGM0M7XFxyXFxuICBjb2xvcjogI2ZmZjtcXHJcXG59XFxyXFxuXFxyXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19lcnJvciB7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjREU2MzZGO1xcclxcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNDQTVBNjU7XFxyXFxuICBjb2xvcjogI2ZmZjtcXHJcXG59XFxyXFxuXFxyXFxuLm5vdHlfdGhlbWVfX21pbnQubm90eV90eXBlX19pbmZvLFxcclxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9faW5mb3JtYXRpb24ge1xcclxcbiAgYmFja2dyb3VuZC1jb2xvcjogIzdGN0VGRjtcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjNzQ3M0U4O1xcclxcbiAgY29sb3I6ICNmZmY7XFxyXFxufVxcclxcblxcclxcbi5ub3R5X3RoZW1lX19taW50Lm5vdHlfdHlwZV9fc3VjY2VzcyB7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjQUZDNzY1O1xcclxcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNBMEI1NUM7XFxyXFxuICBjb2xvcjogI2ZmZjtcXHJcXG59XFxyXFxuXCIsXCIvLyBDb2xvcnNcXHJcXG4kcHJpbWFyeTogI0ZFNUYxRTtcXHJcXG4kcHJpbWFyeS1ob3ZlcjogI2IyMzMwMTtcXHJcXG4kc2Vjb25kYXJ5OiAjZjhmOGY4O1xcclxcbiRwdXJlOiNmZmY7XFxyXFxuJGRhcms6IzIzMjMyMztcXHJcXG4kZ3JheTojY2NjO1xcclxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdOyAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICByZXR1cm4gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGNvbnRlbnQsIFwifVwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbignJyk7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiAobW9kdWxlcywgbWVkaWFRdWVyeSwgZGVkdXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCAnJ11dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1kZXN0cnVjdHVyaW5nXG4gICAgICAgIHZhciBpZCA9IHRoaXNbaV1bMF07XG5cbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbW9kdWxlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2ldKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250aW51ZVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhUXVlcnkpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhUXVlcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsyXSA9IFwiXCIuY29uY2F0KG1lZGlhUXVlcnksIFwiIGFuZCBcIikuY29uY2F0KGl0ZW1bMl0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHsgcmV0dXJuIF9hcnJheVdpdGhIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IF9ub25JdGVyYWJsZVJlc3QoKTsgfVxuXG5mdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSkge1xuICB2YXIgX2l0ZW0gPSBfc2xpY2VkVG9BcnJheShpdGVtLCA0KSxcbiAgICAgIGNvbnRlbnQgPSBfaXRlbVsxXSxcbiAgICAgIGNzc01hcHBpbmcgPSBfaXRlbVszXTtcblxuICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgJycpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn07IiwiLyogXHJcbiAgQHBhY2thZ2UgTk9UWSAtIERlcGVuZGVuY3ktZnJlZSBub3RpZmljYXRpb24gbGlicmFyeSBcclxuICBAdmVyc2lvbiB2ZXJzaW9uOiAzLjIuMC1iZXRhIFxyXG4gIEBjb250cmlidXRvcnMgaHR0cHM6Ly9naXRodWIuY29tL25lZWRpbS9ub3R5L2dyYXBocy9jb250cmlidXRvcnMgXHJcbiAgQGRvY3VtZW50YXRpb24gRXhhbXBsZXMgYW5kIERvY3VtZW50YXRpb24gLSBodHRwczovL25lZC5pbS9ub3R5IFxyXG4gIEBsaWNlbnNlIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZXM6IGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwIFxyXG4qL1xyXG5cclxuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJOb3R5XCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIk5vdHlcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiTm90eVwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbi8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4vKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuLyoqKioqKi8gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuLyoqKioqKi8gXHRcdFx0XHRnZXQ6IGdldHRlclxuLyoqKioqKi8gXHRcdFx0fSk7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDYpO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jc3MgPSBleHBvcnRzLmRlZXBFeHRlbmQgPSBleHBvcnRzLmFuaW1hdGlvbkVuZEV2ZW50cyA9IHVuZGVmaW5lZDtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5leHBvcnRzLmluQXJyYXkgPSBpbkFycmF5O1xuZXhwb3J0cy5zdG9wUHJvcGFnYXRpb24gPSBzdG9wUHJvcGFnYXRpb247XG5leHBvcnRzLmdlbmVyYXRlSUQgPSBnZW5lcmF0ZUlEO1xuZXhwb3J0cy5vdXRlckhlaWdodCA9IG91dGVySGVpZ2h0O1xuZXhwb3J0cy5hZGRMaXN0ZW5lciA9IGFkZExpc3RlbmVyO1xuZXhwb3J0cy5oYXNDbGFzcyA9IGhhc0NsYXNzO1xuZXhwb3J0cy5hZGRDbGFzcyA9IGFkZENsYXNzO1xuZXhwb3J0cy5yZW1vdmVDbGFzcyA9IHJlbW92ZUNsYXNzO1xuZXhwb3J0cy5yZW1vdmUgPSByZW1vdmU7XG5leHBvcnRzLmNsYXNzTGlzdCA9IGNsYXNzTGlzdDtcbmV4cG9ydHMudmlzaWJpbGl0eUNoYW5nZUZsb3cgPSB2aXNpYmlsaXR5Q2hhbmdlRmxvdztcbmV4cG9ydHMuY3JlYXRlQXVkaW9FbGVtZW50cyA9IGNyZWF0ZUF1ZGlvRWxlbWVudHM7XG5cbnZhciBfYXBpID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcblxudmFyIEFQSSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9hcGkpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqLmRlZmF1bHQgPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG52YXIgYW5pbWF0aW9uRW5kRXZlbnRzID0gZXhwb3J0cy5hbmltYXRpb25FbmRFdmVudHMgPSAnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCc7XG5cbmZ1bmN0aW9uIGluQXJyYXkobmVlZGxlLCBoYXlzdGFjaywgYXJnU3RyaWN0KSB7XG4gIHZhciBrZXkgPSB2b2lkIDA7XG4gIHZhciBzdHJpY3QgPSAhIWFyZ1N0cmljdDtcblxuICBpZiAoc3RyaWN0KSB7XG4gICAgZm9yIChrZXkgaW4gaGF5c3RhY2spIHtcbiAgICAgIGlmIChoYXlzdGFjay5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGhheXN0YWNrW2tleV0gPT09IG5lZWRsZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChrZXkgaW4gaGF5c3RhY2spIHtcbiAgICAgIGlmIChoYXlzdGFjay5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGhheXN0YWNrW2tleV0gPT09IG5lZWRsZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24oZXZ0KSB7XG4gIGV2dCA9IGV2dCB8fCB3aW5kb3cuZXZlbnQ7XG5cbiAgaWYgKHR5cGVvZiBldnQuc3RvcFByb3BhZ2F0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSBlbHNlIHtcbiAgICBldnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgfVxufVxuXG52YXIgZGVlcEV4dGVuZCA9IGV4cG9ydHMuZGVlcEV4dGVuZCA9IGZ1bmN0aW9uIGRlZXBFeHRlbmQob3V0KSB7XG4gIG91dCA9IG91dCB8fCB7fTtcblxuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBvYmogPSBhcmd1bWVudHNbaV07XG5cbiAgICBpZiAoIW9iaikgY29udGludWU7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqW2tleV0pKSB7XG4gICAgICAgICAgb3V0W2tleV0gPSBvYmpba2V5XTtcbiAgICAgICAgfSBlbHNlIGlmIChfdHlwZW9mKG9ialtrZXldKSA9PT0gJ29iamVjdCcgJiYgb2JqW2tleV0gIT09IG51bGwpIHtcbiAgICAgICAgICBvdXRba2V5XSA9IGRlZXBFeHRlbmQob3V0W2tleV0sIG9ialtrZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXRba2V5XSA9IG9ialtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbmZ1bmN0aW9uIGdlbmVyYXRlSUQoKSB7XG4gIHZhciBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuXG4gIHZhciBpZCA9ICdub3R5XycgKyBwcmVmaXggKyAnXyc7XG5cbiAgaWQgKz0gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMDtcbiAgICB2YXIgdiA9IGMgPT09ICd4JyA/IHIgOiByICYgMHgzIHwgMHg4O1xuICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBvdXRlckhlaWdodChlbCkge1xuICB2YXIgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG5cbiAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20pO1xuICByZXR1cm4gaGVpZ2h0O1xufVxuXG52YXIgY3NzID0gZXhwb3J0cy5jc3MgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjc3NQcmVmaXhlcyA9IFsnV2Via2l0JywgJ08nLCAnTW96JywgJ21zJ107XG4gIHZhciBjc3NQcm9wcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGNhbWVsQ2FzZShzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL14tbXMtLywgJ21zLScpLnJlcGxhY2UoLy0oW1xcZGEtel0pL2dpLCBmdW5jdGlvbiAobWF0Y2gsIGxldHRlcikge1xuICAgICAgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VmVuZG9yUHJvcChuYW1lKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuYm9keS5zdHlsZTtcbiAgICBpZiAobmFtZSBpbiBzdHlsZSkgcmV0dXJuIG5hbWU7XG5cbiAgICB2YXIgaSA9IGNzc1ByZWZpeGVzLmxlbmd0aDtcbiAgICB2YXIgY2FwTmFtZSA9IG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuICAgIHZhciB2ZW5kb3JOYW1lID0gdm9pZCAwO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdmVuZG9yTmFtZSA9IGNzc1ByZWZpeGVzW2ldICsgY2FwTmFtZTtcbiAgICAgIGlmICh2ZW5kb3JOYW1lIGluIHN0eWxlKSByZXR1cm4gdmVuZG9yTmFtZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFN0eWxlUHJvcChuYW1lKSB7XG4gICAgbmFtZSA9IGNhbWVsQ2FzZShuYW1lKTtcbiAgICByZXR1cm4gY3NzUHJvcHNbbmFtZV0gfHwgKGNzc1Byb3BzW25hbWVdID0gZ2V0VmVuZG9yUHJvcChuYW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseUNzcyhlbGVtZW50LCBwcm9wLCB2YWx1ZSkge1xuICAgIHByb3AgPSBnZXRTdHlsZVByb3AocHJvcCk7XG4gICAgZWxlbWVudC5zdHlsZVtwcm9wXSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHByb3AgPSB2b2lkIDA7XG4gICAgdmFyIHZhbHVlID0gdm9pZCAwO1xuXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICBmb3IgKHByb3AgaW4gcHJvcGVydGllcykge1xuICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgIHZhbHVlID0gcHJvcGVydGllc1twcm9wXTtcbiAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICBhcHBseUNzcyhlbGVtZW50LCBwcm9wLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcGx5Q3NzKGVsZW1lbnQsIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIH1cbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIoZWwsIGV2ZW50cywgY2IpIHtcbiAgdmFyIHVzZUNhcHR1cmUgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IGZhbHNlO1xuXG4gIGV2ZW50cyA9IGV2ZW50cy5zcGxpdCgnICcpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgY2IsIHVzZUNhcHR1cmUpO1xuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHtcbiAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudHNbaV0sIGNiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFzQ2xhc3MoZWxlbWVudCwgbmFtZSkge1xuICB2YXIgbGlzdCA9IHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJyA/IGVsZW1lbnQgOiBjbGFzc0xpc3QoZWxlbWVudCk7XG4gIHJldHVybiBsaXN0LmluZGV4T2YoJyAnICsgbmFtZSArICcgJykgPj0gMDtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3MoZWxlbWVudCwgbmFtZSkge1xuICB2YXIgb2xkTGlzdCA9IGNsYXNzTGlzdChlbGVtZW50KTtcbiAgdmFyIG5ld0xpc3QgPSBvbGRMaXN0ICsgbmFtZTtcblxuICBpZiAoaGFzQ2xhc3Mob2xkTGlzdCwgbmFtZSkpIHJldHVybjtcblxuICAvLyBUcmltIHRoZSBvcGVuaW5nIHNwYWNlLlxuICBlbGVtZW50LmNsYXNzTmFtZSA9IG5ld0xpc3Quc3Vic3RyaW5nKDEpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtZW50LCBuYW1lKSB7XG4gIHZhciBvbGRMaXN0ID0gY2xhc3NMaXN0KGVsZW1lbnQpO1xuICB2YXIgbmV3TGlzdCA9IHZvaWQgMDtcblxuICBpZiAoIWhhc0NsYXNzKGVsZW1lbnQsIG5hbWUpKSByZXR1cm47XG5cbiAgLy8gUmVwbGFjZSB0aGUgY2xhc3MgbmFtZS5cbiAgbmV3TGlzdCA9IG9sZExpc3QucmVwbGFjZSgnICcgKyBuYW1lICsgJyAnLCAnICcpO1xuXG4gIC8vIFRyaW0gdGhlIG9wZW5pbmcgYW5kIGNsb3Npbmcgc3BhY2VzLlxuICBlbGVtZW50LmNsYXNzTmFtZSA9IG5ld0xpc3Quc3Vic3RyaW5nKDEsIG5ld0xpc3QubGVuZ3RoIC0gMSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xhc3NMaXN0KGVsZW1lbnQpIHtcbiAgcmV0dXJuICgnICcgKyAoZWxlbWVudCAmJiBlbGVtZW50LmNsYXNzTmFtZSB8fCAnJykgKyAnICcpLnJlcGxhY2UoL1xccysvZ2ksICcgJyk7XG59XG5cbmZ1bmN0aW9uIHZpc2liaWxpdHlDaGFuZ2VGbG93KCkge1xuICB2YXIgaGlkZGVuID0gdm9pZCAwO1xuICB2YXIgdmlzaWJpbGl0eUNoYW5nZSA9IHZvaWQgMDtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudC5oaWRkZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gT3BlcmEgMTIuMTAgYW5kIEZpcmVmb3ggMTggYW5kIGxhdGVyIHN1cHBvcnRcbiAgICBoaWRkZW4gPSAnaGlkZGVuJztcbiAgICB2aXNpYmlsaXR5Q2hhbmdlID0gJ3Zpc2liaWxpdHljaGFuZ2UnO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBoaWRkZW4gPSAnbXNIaWRkZW4nO1xuICAgIHZpc2liaWxpdHlDaGFuZ2UgPSAnbXN2aXNpYmlsaXR5Y2hhbmdlJztcbiAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQud2Via2l0SGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgIGhpZGRlbiA9ICd3ZWJraXRIaWRkZW4nO1xuICAgIHZpc2liaWxpdHlDaGFuZ2UgPSAnd2Via2l0dmlzaWJpbGl0eWNoYW5nZSc7XG4gIH1cblxuICBmdW5jdGlvbiBvblZpc2liaWxpdHlDaGFuZ2UoKSB7XG4gICAgQVBJLlBhZ2VIaWRkZW4gPSBkb2N1bWVudFtoaWRkZW5dO1xuICAgIGhhbmRsZVZpc2liaWxpdHlDaGFuZ2UoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQmx1cigpIHtcbiAgICBBUEkuUGFnZUhpZGRlbiA9IHRydWU7XG4gICAgaGFuZGxlVmlzaWJpbGl0eUNoYW5nZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Gb2N1cygpIHtcbiAgICBBUEkuUGFnZUhpZGRlbiA9IGZhbHNlO1xuICAgIGhhbmRsZVZpc2liaWxpdHlDaGFuZ2UoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVZpc2liaWxpdHlDaGFuZ2UoKSB7XG4gICAgaWYgKEFQSS5QYWdlSGlkZGVuKSBzdG9wQWxsKCk7ZWxzZSByZXN1bWVBbGwoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BBbGwoKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBPYmplY3Qua2V5cyhBUEkuU3RvcmUpLmZvckVhY2goZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIGlmIChBUEkuU3RvcmUuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgaWYgKEFQSS5TdG9yZVtpZF0ub3B0aW9ucy52aXNpYmlsaXR5Q29udHJvbCkge1xuICAgICAgICAgICAgQVBJLlN0b3JlW2lkXS5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCAxMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzdW1lQWxsKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgT2JqZWN0LmtleXMoQVBJLlN0b3JlKS5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBpZiAoQVBJLlN0b3JlLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgICAgICAgIGlmIChBUEkuU3RvcmVbaWRdLm9wdGlvbnMudmlzaWJpbGl0eUNvbnRyb2wpIHtcbiAgICAgICAgICAgIEFQSS5TdG9yZVtpZF0ucmVzdW1lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIEFQSS5xdWV1ZVJlbmRlckFsbCgpO1xuICAgIH0sIDEwMCk7XG4gIH1cblxuICBpZiAodmlzaWJpbGl0eUNoYW5nZSkge1xuICAgIGFkZExpc3RlbmVyKGRvY3VtZW50LCB2aXNpYmlsaXR5Q2hhbmdlLCBvblZpc2liaWxpdHlDaGFuZ2UpO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIod2luZG93LCAnYmx1cicsIG9uQmx1cik7XG4gIGFkZExpc3RlbmVyKHdpbmRvdywgJ2ZvY3VzJywgb25Gb2N1cyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUF1ZGlvRWxlbWVudHMocmVmKSB7XG4gIGlmIChyZWYuaGFzU291bmQpIHtcbiAgICB2YXIgYXVkaW9FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcblxuICAgIHJlZi5vcHRpb25zLnNvdW5kcy5zb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcbiAgICAgIHNvdXJjZS5zcmMgPSBzO1xuICAgICAgc291cmNlLnR5cGUgPSAnYXVkaW8vJyArIGdldEV4dGVuc2lvbihzKTtcbiAgICAgIGF1ZGlvRWxlbWVudC5hcHBlbmRDaGlsZChzb3VyY2UpO1xuICAgIH0pO1xuXG4gICAgaWYgKHJlZi5iYXJEb20pIHtcbiAgICAgIHJlZi5iYXJEb20uYXBwZW5kQ2hpbGQoYXVkaW9FbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFwcGVuZENoaWxkKGF1ZGlvRWxlbWVudCk7XG4gICAgfVxuXG4gICAgYXVkaW9FbGVtZW50LnZvbHVtZSA9IHJlZi5vcHRpb25zLnNvdW5kcy52b2x1bWU7XG5cbiAgICBpZiAoIXJlZi5zb3VuZFBsYXllZCkge1xuICAgICAgYXVkaW9FbGVtZW50LnBsYXkoKTtcbiAgICAgIHJlZi5zb3VuZFBsYXllZCA9IHRydWU7XG4gICAgfVxuXG4gICAgYXVkaW9FbGVtZW50Lm9uZW5kZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZW1vdmUoYXVkaW9FbGVtZW50KTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEV4dGVuc2lvbihmaWxlTmFtZSkge1xuICByZXR1cm4gZmlsZU5hbWUubWF0Y2goL1xcLihbXi5dKykkLylbMV07XG59XG5cbi8qKiovIH0pLFxuLyogMSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5EZWZhdWx0cyA9IGV4cG9ydHMuU3RvcmUgPSBleHBvcnRzLlF1ZXVlcyA9IGV4cG9ydHMuRGVmYXVsdE1heFZpc2libGUgPSBleHBvcnRzLmRvY1RpdGxlID0gZXhwb3J0cy5Eb2NNb2RhbENvdW50ID0gZXhwb3J0cy5QYWdlSGlkZGVuID0gdW5kZWZpbmVkO1xuZXhwb3J0cy5nZXRRdWV1ZUNvdW50cyA9IGdldFF1ZXVlQ291bnRzO1xuZXhwb3J0cy5hZGRUb1F1ZXVlID0gYWRkVG9RdWV1ZTtcbmV4cG9ydHMucmVtb3ZlRnJvbVF1ZXVlID0gcmVtb3ZlRnJvbVF1ZXVlO1xuZXhwb3J0cy5xdWV1ZVJlbmRlciA9IHF1ZXVlUmVuZGVyO1xuZXhwb3J0cy5xdWV1ZVJlbmRlckFsbCA9IHF1ZXVlUmVuZGVyQWxsO1xuZXhwb3J0cy5naG9zdEZpeCA9IGdob3N0Rml4O1xuZXhwb3J0cy5idWlsZCA9IGJ1aWxkO1xuZXhwb3J0cy5oYXNCdXR0b25zID0gaGFzQnV0dG9ucztcbmV4cG9ydHMuaGFuZGxlTW9kYWwgPSBoYW5kbGVNb2RhbDtcbmV4cG9ydHMuaGFuZGxlTW9kYWxDbG9zZSA9IGhhbmRsZU1vZGFsQ2xvc2U7XG5leHBvcnRzLnF1ZXVlQ2xvc2UgPSBxdWV1ZUNsb3NlO1xuZXhwb3J0cy5kZXF1ZXVlQ2xvc2UgPSBkZXF1ZXVlQ2xvc2U7XG5leHBvcnRzLmZpcmUgPSBmaXJlO1xuZXhwb3J0cy5vcGVuRmxvdyA9IG9wZW5GbG93O1xuZXhwb3J0cy5jbG9zZUZsb3cgPSBjbG9zZUZsb3c7XG5cbnZhciBfdXRpbHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfdXRpbHMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqLmRlZmF1bHQgPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG52YXIgUGFnZUhpZGRlbiA9IGV4cG9ydHMuUGFnZUhpZGRlbiA9IGZhbHNlO1xudmFyIERvY01vZGFsQ291bnQgPSBleHBvcnRzLkRvY01vZGFsQ291bnQgPSAwO1xuXG52YXIgRG9jVGl0bGVQcm9wcyA9IHtcbiAgb3JpZ2luYWxUaXRsZTogbnVsbCxcbiAgY291bnQ6IDAsXG4gIGNoYW5nZWQ6IGZhbHNlLFxuICB0aW1lcjogLTFcbn07XG5cbnZhciBkb2NUaXRsZSA9IGV4cG9ydHMuZG9jVGl0bGUgPSB7XG4gIGluY3JlbWVudDogZnVuY3Rpb24gaW5jcmVtZW50KCkge1xuICAgIERvY1RpdGxlUHJvcHMuY291bnQrKztcblxuICAgIGRvY1RpdGxlLl91cGRhdGUoKTtcbiAgfSxcblxuICBkZWNyZW1lbnQ6IGZ1bmN0aW9uIGRlY3JlbWVudCgpIHtcbiAgICBEb2NUaXRsZVByb3BzLmNvdW50LS07XG5cbiAgICBpZiAoRG9jVGl0bGVQcm9wcy5jb3VudCA8PSAwKSB7XG4gICAgICBkb2NUaXRsZS5fY2xlYXIoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb2NUaXRsZS5fdXBkYXRlKCk7XG4gIH0sXG5cbiAgX3VwZGF0ZTogZnVuY3Rpb24gX3VwZGF0ZSgpIHtcbiAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcblxuICAgIGlmICghRG9jVGl0bGVQcm9wcy5jaGFuZ2VkKSB7XG4gICAgICBEb2NUaXRsZVByb3BzLm9yaWdpbmFsVGl0bGUgPSB0aXRsZTtcbiAgICAgIGRvY3VtZW50LnRpdGxlID0gJygnICsgRG9jVGl0bGVQcm9wcy5jb3VudCArICcpICcgKyB0aXRsZTtcbiAgICAgIERvY1RpdGxlUHJvcHMuY2hhbmdlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LnRpdGxlID0gJygnICsgRG9jVGl0bGVQcm9wcy5jb3VudCArICcpICcgKyBEb2NUaXRsZVByb3BzLm9yaWdpbmFsVGl0bGU7XG4gICAgfVxuICB9LFxuXG4gIF9jbGVhcjogZnVuY3Rpb24gX2NsZWFyKCkge1xuICAgIGlmIChEb2NUaXRsZVByb3BzLmNoYW5nZWQpIHtcbiAgICAgIERvY1RpdGxlUHJvcHMuY291bnQgPSAwO1xuICAgICAgZG9jdW1lbnQudGl0bGUgPSBEb2NUaXRsZVByb3BzLm9yaWdpbmFsVGl0bGU7XG4gICAgICBEb2NUaXRsZVByb3BzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBEZWZhdWx0TWF4VmlzaWJsZSA9IGV4cG9ydHMuRGVmYXVsdE1heFZpc2libGUgPSA1O1xuXG52YXIgUXVldWVzID0gZXhwb3J0cy5RdWV1ZXMgPSB7XG4gIGdsb2JhbDoge1xuICAgIG1heFZpc2libGU6IERlZmF1bHRNYXhWaXNpYmxlLFxuICAgIHF1ZXVlOiBbXVxuICB9XG59O1xuXG52YXIgU3RvcmUgPSBleHBvcnRzLlN0b3JlID0ge307XG5cbnZhciBEZWZhdWx0cyA9IGV4cG9ydHMuRGVmYXVsdHMgPSB7XG4gIHR5cGU6ICdhbGVydCcsXG4gIGxheW91dDogJ3RvcFJpZ2h0JyxcbiAgdGhlbWU6ICdtaW50JyxcbiAgdGV4dDogJycsXG4gIHRpbWVvdXQ6IGZhbHNlLFxuICBwcm9ncmVzc0JhcjogdHJ1ZSxcbiAgY2xvc2VXaXRoOiBbJ2NsaWNrJ10sXG4gIGFuaW1hdGlvbjoge1xuICAgIG9wZW46ICdub3R5X2VmZmVjdHNfb3BlbicsXG4gICAgY2xvc2U6ICdub3R5X2VmZmVjdHNfY2xvc2UnXG4gIH0sXG4gIGlkOiBmYWxzZSxcbiAgZm9yY2U6IGZhbHNlLFxuICBraWxsZXI6IGZhbHNlLFxuICBxdWV1ZTogJ2dsb2JhbCcsXG4gIGNvbnRhaW5lcjogZmFsc2UsXG4gIGJ1dHRvbnM6IFtdLFxuICBjYWxsYmFja3M6IHtcbiAgICBiZWZvcmVTaG93OiBudWxsLFxuICAgIG9uU2hvdzogbnVsbCxcbiAgICBhZnRlclNob3c6IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBhZnRlckNsb3NlOiBudWxsLFxuICAgIG9uQ2xpY2s6IG51bGwsXG4gICAgb25Ib3ZlcjogbnVsbCxcbiAgICBvblRlbXBsYXRlOiBudWxsXG4gIH0sXG4gIHNvdW5kczoge1xuICAgIHNvdXJjZXM6IFtdLFxuICAgIHZvbHVtZTogMSxcbiAgICBjb25kaXRpb25zOiBbXVxuICB9LFxuICB0aXRsZUNvdW50OiB7XG4gICAgY29uZGl0aW9uczogW11cbiAgfSxcbiAgbW9kYWw6IGZhbHNlLFxuICB2aXNpYmlsaXR5Q29udHJvbDogZmFsc2VcblxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcXVldWVOYW1lXHJcbiAgICogQHJldHVybiB7b2JqZWN0fVxyXG4gICAqL1xufTtmdW5jdGlvbiBnZXRRdWV1ZUNvdW50cygpIHtcbiAgdmFyIHF1ZXVlTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJ2dsb2JhbCc7XG5cbiAgdmFyIGNvdW50ID0gMDtcbiAgdmFyIG1heCA9IERlZmF1bHRNYXhWaXNpYmxlO1xuXG4gIGlmIChRdWV1ZXMuaGFzT3duUHJvcGVydHkocXVldWVOYW1lKSkge1xuICAgIG1heCA9IFF1ZXVlc1txdWV1ZU5hbWVdLm1heFZpc2libGU7XG4gICAgT2JqZWN0LmtleXMoU3RvcmUpLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgIGlmIChTdG9yZVtpXS5vcHRpb25zLnF1ZXVlID09PSBxdWV1ZU5hbWUgJiYgIVN0b3JlW2ldLmNsb3NlZCkgY291bnQrKztcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY3VycmVudDogY291bnQsXG4gICAgbWF4VmlzaWJsZTogbWF4XG4gIH07XG59XG5cbi8qKlxyXG4gKiBAcGFyYW0ge05vdHl9IHJlZlxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cbmZ1bmN0aW9uIGFkZFRvUXVldWUocmVmKSB7XG4gIGlmICghUXVldWVzLmhhc093blByb3BlcnR5KHJlZi5vcHRpb25zLnF1ZXVlKSkge1xuICAgIFF1ZXVlc1tyZWYub3B0aW9ucy5xdWV1ZV0gPSB7IG1heFZpc2libGU6IERlZmF1bHRNYXhWaXNpYmxlLCBxdWV1ZTogW10gfTtcbiAgfVxuXG4gIFF1ZXVlc1tyZWYub3B0aW9ucy5xdWV1ZV0ucXVldWUucHVzaChyZWYpO1xufVxuXG4vKipcclxuICogQHBhcmFtIHtOb3R5fSByZWZcclxuICogQHJldHVybiB7dm9pZH1cclxuICovXG5mdW5jdGlvbiByZW1vdmVGcm9tUXVldWUocmVmKSB7XG4gIGlmIChRdWV1ZXMuaGFzT3duUHJvcGVydHkocmVmLm9wdGlvbnMucXVldWUpKSB7XG4gICAgdmFyIHF1ZXVlID0gW107XG4gICAgT2JqZWN0LmtleXMoUXVldWVzW3JlZi5vcHRpb25zLnF1ZXVlXS5xdWV1ZSkuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgaWYgKFF1ZXVlc1tyZWYub3B0aW9ucy5xdWV1ZV0ucXVldWVbaV0uaWQgIT09IHJlZi5pZCkge1xuICAgICAgICBxdWV1ZS5wdXNoKFF1ZXVlc1tyZWYub3B0aW9ucy5xdWV1ZV0ucXVldWVbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFF1ZXVlc1tyZWYub3B0aW9ucy5xdWV1ZV0ucXVldWUgPSBxdWV1ZTtcbiAgfVxufVxuXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IHF1ZXVlTmFtZVxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cbmZ1bmN0aW9uIHF1ZXVlUmVuZGVyKCkge1xuICB2YXIgcXVldWVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnZ2xvYmFsJztcblxuICBpZiAoUXVldWVzLmhhc093blByb3BlcnR5KHF1ZXVlTmFtZSkpIHtcbiAgICB2YXIgbm90eSA9IFF1ZXVlc1txdWV1ZU5hbWVdLnF1ZXVlLnNoaWZ0KCk7XG5cbiAgICBpZiAobm90eSkgbm90eS5zaG93KCk7XG4gIH1cbn1cblxuLyoqXHJcbiAqIEByZXR1cm4ge3ZvaWR9XHJcbiAqL1xuZnVuY3Rpb24gcXVldWVSZW5kZXJBbGwoKSB7XG4gIE9iamVjdC5rZXlzKFF1ZXVlcykuZm9yRWFjaChmdW5jdGlvbiAocXVldWVOYW1lKSB7XG4gICAgcXVldWVSZW5kZXIocXVldWVOYW1lKTtcbiAgfSk7XG59XG5cbi8qKlxyXG4gKiBAcGFyYW0ge05vdHl9IHJlZlxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cbmZ1bmN0aW9uIGdob3N0Rml4KHJlZikge1xuICB2YXIgZ2hvc3RJRCA9IFV0aWxzLmdlbmVyYXRlSUQoJ2dob3N0Jyk7XG4gIHZhciBnaG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBnaG9zdC5zZXRBdHRyaWJ1dGUoJ2lkJywgZ2hvc3RJRCk7XG4gIFV0aWxzLmNzcyhnaG9zdCwge1xuICAgIGhlaWdodDogVXRpbHMub3V0ZXJIZWlnaHQocmVmLmJhckRvbSkgKyAncHgnXG4gIH0pO1xuXG4gIHJlZi5iYXJEb20uaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmVuZCcsIGdob3N0Lm91dGVySFRNTCk7XG5cbiAgVXRpbHMucmVtb3ZlKHJlZi5iYXJEb20pO1xuICBnaG9zdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGdob3N0SUQpO1xuICBVdGlscy5hZGRDbGFzcyhnaG9zdCwgJ25vdHlfZml4X2VmZmVjdHNfaGVpZ2h0Jyk7XG4gIFV0aWxzLmFkZExpc3RlbmVyKGdob3N0LCBVdGlscy5hbmltYXRpb25FbmRFdmVudHMsIGZ1bmN0aW9uICgpIHtcbiAgICBVdGlscy5yZW1vdmUoZ2hvc3QpO1xuICB9KTtcbn1cblxuLyoqXHJcbiAqIEBwYXJhbSB7Tm90eX0gcmVmXHJcbiAqIEByZXR1cm4ge3ZvaWR9XHJcbiAqL1xuZnVuY3Rpb24gYnVpbGQocmVmKSB7XG4gIGZpbmRPckNyZWF0ZUNvbnRhaW5lcihyZWYpO1xuXG4gIHZhciBtYXJrdXAgPSAnPGRpdiBjbGFzcz1cIm5vdHlfYm9keVwiPicgKyByZWYub3B0aW9ucy50ZXh0ICsgJzwvZGl2PicgKyBidWlsZEJ1dHRvbnMocmVmKSArICc8ZGl2IGNsYXNzPVwibm90eV9wcm9ncmVzc2JhclwiPjwvZGl2Pic7XG5cbiAgcmVmLmJhckRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICByZWYuYmFyRG9tLnNldEF0dHJpYnV0ZSgnaWQnLCByZWYuaWQpO1xuICBVdGlscy5hZGRDbGFzcyhyZWYuYmFyRG9tLCAnbm90eV9iYXIgbm90eV90eXBlX18nICsgcmVmLm9wdGlvbnMudHlwZSArICcgbm90eV90aGVtZV9fJyArIHJlZi5vcHRpb25zLnRoZW1lKTtcblxuICByZWYuYmFyRG9tLmlubmVySFRNTCA9IG1hcmt1cDtcblxuICBmaXJlKHJlZiwgJ29uVGVtcGxhdGUnKTtcbn1cblxuLyoqXHJcbiAqIEBwYXJhbSB7Tm90eX0gcmVmXHJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAqL1xuZnVuY3Rpb24gaGFzQnV0dG9ucyhyZWYpIHtcbiAgcmV0dXJuICEhKHJlZi5vcHRpb25zLmJ1dHRvbnMgJiYgT2JqZWN0LmtleXMocmVmLm9wdGlvbnMuYnV0dG9ucykubGVuZ3RoKTtcbn1cblxuLyoqXHJcbiAqIEBwYXJhbSB7Tm90eX0gcmVmXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXG5mdW5jdGlvbiBidWlsZEJ1dHRvbnMocmVmKSB7XG4gIGlmIChoYXNCdXR0b25zKHJlZikpIHtcbiAgICB2YXIgYnV0dG9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIFV0aWxzLmFkZENsYXNzKGJ1dHRvbnMsICdub3R5X2J1dHRvbnMnKTtcblxuICAgIE9iamVjdC5rZXlzKHJlZi5vcHRpb25zLmJ1dHRvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgYnV0dG9ucy5hcHBlbmRDaGlsZChyZWYub3B0aW9ucy5idXR0b25zW2tleV0uZG9tKTtcbiAgICB9KTtcblxuICAgIHJlZi5vcHRpb25zLmJ1dHRvbnMuZm9yRWFjaChmdW5jdGlvbiAoYnRuKSB7XG4gICAgICBidXR0b25zLmFwcGVuZENoaWxkKGJ0bi5kb20pO1xuICAgIH0pO1xuICAgIHJldHVybiBidXR0b25zLm91dGVySFRNTDtcbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbi8qKlxyXG4gKiBAcGFyYW0ge05vdHl9IHJlZlxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZU1vZGFsKHJlZikge1xuICBpZiAocmVmLm9wdGlvbnMubW9kYWwpIHtcbiAgICBpZiAoRG9jTW9kYWxDb3VudCA9PT0gMCkge1xuICAgICAgY3JlYXRlTW9kYWwocmVmKTtcbiAgICB9XG5cbiAgICBleHBvcnRzLkRvY01vZGFsQ291bnQgPSBEb2NNb2RhbENvdW50ICs9IDE7XG4gIH1cbn1cblxuLyoqXHJcbiAqIEBwYXJhbSB7Tm90eX0gcmVmXHJcbiAqIEByZXR1cm4ge3ZvaWR9XHJcbiAqL1xuZnVuY3Rpb24gaGFuZGxlTW9kYWxDbG9zZShyZWYpIHtcbiAgaWYgKHJlZi5vcHRpb25zLm1vZGFsICYmIERvY01vZGFsQ291bnQgPiAwKSB7XG4gICAgZXhwb3J0cy5Eb2NNb2RhbENvdW50ID0gRG9jTW9kYWxDb3VudCAtPSAxO1xuXG4gICAgaWYgKERvY01vZGFsQ291bnQgPD0gMCkge1xuICAgICAgdmFyIG1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5vdHlfbW9kYWwnKTtcblxuICAgICAgaWYgKG1vZGFsKSB7XG4gICAgICAgIFV0aWxzLnJlbW92ZUNsYXNzKG1vZGFsLCAnbm90eV9tb2RhbF9vcGVuJyk7XG4gICAgICAgIFV0aWxzLmFkZENsYXNzKG1vZGFsLCAnbm90eV9tb2RhbF9jbG9zZScpO1xuICAgICAgICBVdGlscy5hZGRMaXN0ZW5lcihtb2RhbCwgVXRpbHMuYW5pbWF0aW9uRW5kRXZlbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgVXRpbHMucmVtb3ZlKG1vZGFsKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU1vZGFsKCkge1xuICB2YXIgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbiAgdmFyIG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIFV0aWxzLmFkZENsYXNzKG1vZGFsLCAnbm90eV9tb2RhbCcpO1xuICBib2R5Lmluc2VydEJlZm9yZShtb2RhbCwgYm9keS5maXJzdENoaWxkKTtcbiAgVXRpbHMuYWRkQ2xhc3MobW9kYWwsICdub3R5X21vZGFsX29wZW4nKTtcblxuICBVdGlscy5hZGRMaXN0ZW5lcihtb2RhbCwgVXRpbHMuYW5pbWF0aW9uRW5kRXZlbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgVXRpbHMucmVtb3ZlQ2xhc3MobW9kYWwsICdub3R5X21vZGFsX29wZW4nKTtcbiAgfSk7XG59XG5cbi8qKlxyXG4gKiBAcGFyYW0ge05vdHl9IHJlZlxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cbmZ1bmN0aW9uIGZpbmRPckNyZWF0ZUNvbnRhaW5lcihyZWYpIHtcbiAgaWYgKHJlZi5vcHRpb25zLmNvbnRhaW5lcikge1xuICAgIHJlZi5sYXlvdXREb20gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHJlZi5vcHRpb25zLmNvbnRhaW5lcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGxheW91dElEID0gJ25vdHlfbGF5b3V0X18nICsgcmVmLm9wdGlvbnMubGF5b3V0O1xuICByZWYubGF5b3V0RG9tID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGl2IycgKyBsYXlvdXRJRCk7XG5cbiAgaWYgKCFyZWYubGF5b3V0RG9tKSB7XG4gICAgcmVmLmxheW91dERvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJlZi5sYXlvdXREb20uc2V0QXR0cmlidXRlKCdpZCcsIGxheW91dElEKTtcbiAgICByZWYubGF5b3V0RG9tLnNldEF0dHJpYnV0ZSgncm9sZScsICdhbGVydCcpO1xuICAgIHJlZi5sYXlvdXREb20uc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XG4gICAgVXRpbHMuYWRkQ2xhc3MocmVmLmxheW91dERvbSwgJ25vdHlfbGF5b3V0Jyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFwcGVuZENoaWxkKHJlZi5sYXlvdXREb20pO1xuICB9XG59XG5cbi8qKlxyXG4gKiBAcGFyYW0ge05vdHl9IHJlZlxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cbmZ1bmN0aW9uIHF1ZXVlQ2xvc2UocmVmKSB7XG4gIGlmIChyZWYub3B0aW9ucy50aW1lb3V0KSB7XG4gICAgaWYgKHJlZi5vcHRpb25zLnByb2dyZXNzQmFyICYmIHJlZi5wcm9ncmVzc0RvbSkge1xuICAgICAgVXRpbHMuY3NzKHJlZi5wcm9ncmVzc0RvbSwge1xuICAgICAgICB0cmFuc2l0aW9uOiAnd2lkdGggJyArIHJlZi5vcHRpb25zLnRpbWVvdXQgKyAnbXMgbGluZWFyJyxcbiAgICAgICAgd2lkdGg6ICcwJSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsZWFyVGltZW91dChyZWYuY2xvc2VUaW1lcik7XG5cbiAgICByZWYuY2xvc2VUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgcmVmLmNsb3NlKCk7XG4gICAgfSwgcmVmLm9wdGlvbnMudGltZW91dCk7XG4gIH1cbn1cblxuLyoqXHJcbiAqIEBwYXJhbSB7Tm90eX0gcmVmXHJcbiAqIEByZXR1cm4ge3ZvaWR9XHJcbiAqL1xuZnVuY3Rpb24gZGVxdWV1ZUNsb3NlKHJlZikge1xuICBpZiAocmVmLm9wdGlvbnMudGltZW91dCAmJiByZWYuY2xvc2VUaW1lcikge1xuICAgIGNsZWFyVGltZW91dChyZWYuY2xvc2VUaW1lcik7XG4gICAgcmVmLmNsb3NlVGltZXIgPSAtMTtcblxuICAgIGlmIChyZWYub3B0aW9ucy5wcm9ncmVzc0JhciAmJiByZWYucHJvZ3Jlc3NEb20pIHtcbiAgICAgIFV0aWxzLmNzcyhyZWYucHJvZ3Jlc3NEb20sIHtcbiAgICAgICAgdHJhbnNpdGlvbjogJ3dpZHRoIDBtcyBsaW5lYXInLFxuICAgICAgICB3aWR0aDogJzEwMCUnXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXHJcbiAqIEBwYXJhbSB7Tm90eX0gcmVmXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcclxuICogQHJldHVybiB7dm9pZH1cclxuICovXG5mdW5jdGlvbiBmaXJlKHJlZiwgZXZlbnROYW1lKSB7XG4gIGlmIChyZWYubGlzdGVuZXJzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICByZWYubGlzdGVuZXJzW2V2ZW50TmFtZV0uZm9yRWFjaChmdW5jdGlvbiAoY2IpIHtcbiAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2IuYXBwbHkocmVmKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcclxuICogQHBhcmFtIHtOb3R5fSByZWZcclxuICogQHJldHVybiB7dm9pZH1cclxuICovXG5mdW5jdGlvbiBvcGVuRmxvdyhyZWYpIHtcbiAgZmlyZShyZWYsICdhZnRlclNob3cnKTtcbiAgcXVldWVDbG9zZShyZWYpO1xuXG4gIFV0aWxzLmFkZExpc3RlbmVyKHJlZi5iYXJEb20sICdtb3VzZWVudGVyJywgZnVuY3Rpb24gKCkge1xuICAgIGRlcXVldWVDbG9zZShyZWYpO1xuICB9KTtcblxuICBVdGlscy5hZGRMaXN0ZW5lcihyZWYuYmFyRG9tLCAnbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBxdWV1ZUNsb3NlKHJlZik7XG4gIH0pO1xufVxuXG4vKipcclxuICogQHBhcmFtIHtOb3R5fSByZWZcclxuICogQHJldHVybiB7dm9pZH1cclxuICovXG5mdW5jdGlvbiBjbG9zZUZsb3cocmVmKSB7XG4gIGRlbGV0ZSBTdG9yZVtyZWYuaWRdO1xuICByZWYuY2xvc2luZyA9IGZhbHNlO1xuICBmaXJlKHJlZiwgJ2FmdGVyQ2xvc2UnKTtcblxuICBVdGlscy5yZW1vdmUocmVmLmJhckRvbSk7XG5cbiAgaWYgKHJlZi5sYXlvdXREb20ucXVlcnlTZWxlY3RvckFsbCgnLm5vdHlfYmFyJykubGVuZ3RoID09PSAwICYmICFyZWYub3B0aW9ucy5jb250YWluZXIpIHtcbiAgICBVdGlscy5yZW1vdmUocmVmLmxheW91dERvbSk7XG4gIH1cblxuICBpZiAoVXRpbHMuaW5BcnJheSgnZG9jVmlzaWJsZScsIHJlZi5vcHRpb25zLnRpdGxlQ291bnQuY29uZGl0aW9ucykgfHwgVXRpbHMuaW5BcnJheSgnZG9jSGlkZGVuJywgcmVmLm9wdGlvbnMudGl0bGVDb3VudC5jb25kaXRpb25zKSkge1xuICAgIGRvY1RpdGxlLmRlY3JlbWVudCgpO1xuICB9XG5cbiAgcXVldWVSZW5kZXIocmVmLm9wdGlvbnMucXVldWUpO1xufVxuXG4vKioqLyB9KSxcbi8qIDIgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTm90eUJ1dHRvbiA9IHVuZGVmaW5lZDtcblxudmFyIF91dGlscyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF91dGlscyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmouZGVmYXVsdCA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBOb3R5QnV0dG9uID0gZXhwb3J0cy5Ob3R5QnV0dG9uID0gZnVuY3Rpb24gTm90eUJ1dHRvbihodG1sLCBjbGFzc2VzLCBjYikge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiB7fTtcblxuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTm90eUJ1dHRvbik7XG5cbiAgdGhpcy5kb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgdGhpcy5kb20uaW5uZXJIVE1MID0gaHRtbDtcbiAgdGhpcy5pZCA9IGF0dHJpYnV0ZXMuaWQgPSBhdHRyaWJ1dGVzLmlkIHx8IFV0aWxzLmdlbmVyYXRlSUQoJ2J1dHRvbicpO1xuICB0aGlzLmNiID0gY2I7XG4gIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgIF90aGlzLmRvbS5zZXRBdHRyaWJ1dGUocHJvcGVydHlOYW1lLCBhdHRyaWJ1dGVzW3Byb3BlcnR5TmFtZV0pO1xuICB9KTtcbiAgVXRpbHMuYWRkQ2xhc3ModGhpcy5kb20sIGNsYXNzZXMgfHwgJ25vdHlfYnRuJyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKioqLyB9KSxcbi8qIDMgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFB1c2ggPSBleHBvcnRzLlB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFB1c2goKSB7XG4gICAgdmFyIHdvcmtlclBhdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcvc2VydmljZS13b3JrZXIuanMnO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFB1c2gpO1xuXG4gICAgdGhpcy5zdWJEYXRhID0ge307XG4gICAgdGhpcy53b3JrZXJQYXRoID0gd29ya2VyUGF0aDtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHtcbiAgICAgIG9uUGVybWlzc2lvbkdyYW50ZWQ6IFtdLFxuICAgICAgb25QZXJtaXNzaW9uRGVuaWVkOiBbXSxcbiAgICAgIG9uU3Vic2NyaXB0aW9uU3VjY2VzczogW10sXG4gICAgICBvblN1YnNjcmlwdGlvbkNhbmNlbDogW10sXG4gICAgICBvbldvcmtlckVycm9yOiBbXSxcbiAgICAgIG9uV29ya2VyU3VjY2VzczogW10sXG4gICAgICBvbldvcmtlck5vdFN1cHBvcnRlZDogW11cbiAgICB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiXHJcbiAgICogQHJldHVybiB7UHVzaH1cclxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhQdXNoLCBbe1xuICAgIGtleTogJ29uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb24oZXZlbnROYW1lKSB7XG4gICAgICB2YXIgY2IgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIHRoaXMubGlzdGVuZXJzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnROYW1lXS5wdXNoKGNiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZmlyZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZpcmUoZXZlbnROYW1lKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgcGFyYW1zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBbXTtcblxuICAgICAgaWYgKHRoaXMubGlzdGVuZXJzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnROYW1lXS5mb3JFYWNoKGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNiLmFwcGx5KF90aGlzLCBwYXJhbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY3JlYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgICAgY29uc29sZS5sb2coJ05PVCBJTVBMRU1FTlRFRCBZRVQnKTtcbiAgICB9XG5cbiAgICAvKipcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnaXNTdXBwb3J0ZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpc1N1cHBvcnRlZCgpIHtcbiAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gd2luZG93Lk5vdGlmaWNhdGlvbiB8fCB3aW5kb3cud2Via2l0Tm90aWZpY2F0aW9ucyB8fCBuYXZpZ2F0b3IubW96Tm90aWZpY2F0aW9uIHx8IHdpbmRvdy5leHRlcm5hbCAmJiB3aW5kb3cuZXh0ZXJuYWwubXNJc1NpdGVNb2RlKCkgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnZ2V0UGVybWlzc2lvblN0YXR1cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBlcm1pc3Npb25TdGF0dXMoKSB7XG4gICAgICB2YXIgcGVybSA9ICdkZWZhdWx0JztcblxuICAgICAgaWYgKHdpbmRvdy5Ob3RpZmljYXRpb24gJiYgd2luZG93Lk5vdGlmaWNhdGlvbi5wZXJtaXNzaW9uTGV2ZWwpIHtcbiAgICAgICAgcGVybSA9IHdpbmRvdy5Ob3RpZmljYXRpb24ucGVybWlzc2lvbkxldmVsO1xuICAgICAgfSBlbHNlIGlmICh3aW5kb3cud2Via2l0Tm90aWZpY2F0aW9ucyAmJiB3aW5kb3cud2Via2l0Tm90aWZpY2F0aW9ucy5jaGVja1Blcm1pc3Npb24pIHtcbiAgICAgICAgc3dpdGNoICh3aW5kb3cud2Via2l0Tm90aWZpY2F0aW9ucy5jaGVja1Blcm1pc3Npb24oKSkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHBlcm0gPSAnZGVmYXVsdCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBwZXJtID0gJ2dyYW50ZWQnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHBlcm0gPSAnZGVuaWVkJztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh3aW5kb3cuTm90aWZpY2F0aW9uICYmIHdpbmRvdy5Ob3RpZmljYXRpb24ucGVybWlzc2lvbikge1xuICAgICAgICBwZXJtID0gd2luZG93Lk5vdGlmaWNhdGlvbi5wZXJtaXNzaW9uO1xuICAgICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IubW96Tm90aWZpY2F0aW9uKSB7XG4gICAgICAgIHBlcm0gPSAnZ3JhbnRlZCc7XG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5leHRlcm5hbCAmJiB3aW5kb3cuZXh0ZXJuYWwubXNJc1NpdGVNb2RlKCkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwZXJtID0gd2luZG93LmV4dGVybmFsLm1zSXNTaXRlTW9kZSgpID8gJ2dyYW50ZWQnIDogJ2RlZmF1bHQnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGVybS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnZ2V0RW5kcG9pbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFbmRwb2ludChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHZhciBlbmRwb2ludCA9IHN1YnNjcmlwdGlvbi5lbmRwb2ludDtcbiAgICAgIHZhciBzdWJzY3JpcHRpb25JZCA9IHN1YnNjcmlwdGlvbi5zdWJzY3JpcHRpb25JZDtcblxuICAgICAgLy8gZml4IGZvciBDaHJvbWUgPCA0NVxuICAgICAgaWYgKHN1YnNjcmlwdGlvbklkICYmIGVuZHBvaW50LmluZGV4T2Yoc3Vic2NyaXB0aW9uSWQpID09PSAtMSkge1xuICAgICAgICBlbmRwb2ludCArPSAnLycgKyBzdWJzY3JpcHRpb25JZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVuZHBvaW50O1xuICAgIH1cblxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdpc1NXUmVnaXN0ZXJlZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGlzU1dSZWdpc3RlcmVkKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmNvbnRyb2xsZXIuc3RhdGUgPT09ICdhY3RpdmF0ZWQnO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3VucmVnaXN0ZXJXb3JrZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bnJlZ2lzdGVyV29ya2VyKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIuZ2V0UmVnaXN0cmF0aW9ucygpLnRoZW4oZnVuY3Rpb24gKHJlZ2lzdHJhdGlvbnMpIHtcbiAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHJlZ2lzdHJhdGlvbnNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciByZWdpc3RyYXRpb24gPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgICAgICByZWdpc3RyYXRpb24udW5yZWdpc3RlcigpO1xuICAgICAgICAgICAgICBzZWxmLmZpcmUoJ29uU3Vic2NyaXB0aW9uQ2FuY2VsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVxdWVzdFN1YnNjcmlwdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlcXVlc3RTdWJzY3JpcHRpb24oKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdmFyIHVzZXJWaXNpYmxlT25seSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogdHJ1ZTtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldFBlcm1pc3Npb25TdGF0dXMoKTtcbiAgICAgIHZhciBjYiA9IGZ1bmN0aW9uIGNiKHJlc3VsdCkge1xuICAgICAgICBpZiAocmVzdWx0ID09PSAnZ3JhbnRlZCcpIHtcbiAgICAgICAgICBfdGhpczIuZmlyZSgnb25QZXJtaXNzaW9uR3JhbnRlZCcpO1xuXG4gICAgICAgICAgaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKF90aGlzMi53b3JrZXJQYXRoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVhZHkudGhlbihmdW5jdGlvbiAoc2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuZmlyZSgnb25Xb3JrZXJTdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgc2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbi5wdXNoTWFuYWdlci5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgICAgdXNlclZpc2libGVPbmx5OiB1c2VyVmlzaWJsZU9ubHlcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBzdWJzY3JpcHRpb24uZ2V0S2V5KCdwMjU2ZGgnKTtcbiAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHN1YnNjcmlwdGlvbi5nZXRLZXkoJ2F1dGgnKTtcblxuICAgICAgICAgICAgICAgICAgc2VsZi5zdWJEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBlbmRwb2ludDogc2VsZi5nZXRFbmRwb2ludChzdWJzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICBwMjU2ZGg6IGtleSA/IHdpbmRvdy5idG9hKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoa2V5KSkpIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdG9rZW4gPyB3aW5kb3cuYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KHRva2VuKSkpIDogbnVsbFxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgc2VsZi5maXJlKCdvblN1YnNjcmlwdGlvblN1Y2Nlc3MnLCBbc2VsZi5zdWJEYXRhXSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgc2VsZi5maXJlKCdvbldvcmtlckVycm9yJywgW2Vycl0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmZpcmUoJ29uV29ya2VyTm90U3VwcG9ydGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCA9PT0gJ2RlbmllZCcpIHtcbiAgICAgICAgICBfdGhpczIuZmlyZSgnb25QZXJtaXNzaW9uRGVuaWVkJyk7XG4gICAgICAgICAgX3RoaXMyLnVucmVnaXN0ZXJXb3JrZXIoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgaWYgKGN1cnJlbnQgPT09ICdkZWZhdWx0Jykge1xuICAgICAgICBpZiAod2luZG93Lk5vdGlmaWNhdGlvbiAmJiB3aW5kb3cuTm90aWZpY2F0aW9uLnJlcXVlc3RQZXJtaXNzaW9uKSB7XG4gICAgICAgICAgd2luZG93Lk5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbihjYik7XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LndlYmtpdE5vdGlmaWNhdGlvbnMgJiYgd2luZG93LndlYmtpdE5vdGlmaWNhdGlvbnMuY2hlY2tQZXJtaXNzaW9uKSB7XG4gICAgICAgICAgd2luZG93LndlYmtpdE5vdGlmaWNhdGlvbnMucmVxdWVzdFBlcm1pc3Npb24oY2IpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYihjdXJyZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUHVzaDtcbn0oKTtcblxuLyoqKi8gfSksXG4vKiA0ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbi8qIFdFQlBBQ0sgVkFSIElOSkVDVElPTiAqLyhmdW5jdGlvbihwcm9jZXNzLCBnbG9iYWwpIHt2YXIgcmVxdWlyZTsvKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vc3RlZmFucGVubmVyL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDQuMS4xXG4gKi9cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0IHRydWUgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwuRVM2UHJvbWlzZSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHg7XG4gIHJldHVybiB4ICE9PSBudWxsICYmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxudmFyIF9pc0FycmF5ID0gdW5kZWZpbmVkO1xuaWYgKEFycmF5LmlzQXJyYXkpIHtcbiAgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xufSBlbHNlIHtcbiAgX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG59XG5cbnZhciBpc0FycmF5ID0gX2lzQXJyYXk7XG5cbnZhciBsZW4gPSAwO1xudmFyIHZlcnR4TmV4dCA9IHVuZGVmaW5lZDtcbnZhciBjdXN0b21TY2hlZHVsZXJGbiA9IHVuZGVmaW5lZDtcblxudmFyIGFzYXAgPSBmdW5jdGlvbiBhc2FwKGNhbGxiYWNrLCBhcmcpIHtcbiAgcXVldWVbbGVuXSA9IGNhbGxiYWNrO1xuICBxdWV1ZVtsZW4gKyAxXSA9IGFyZztcbiAgbGVuICs9IDI7XG4gIGlmIChsZW4gPT09IDIpIHtcbiAgICAvLyBJZiBsZW4gaXMgMiwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgLy8gSWYgYWRkaXRpb25hbCBjYWxsYmFja3MgYXJlIHF1ZXVlZCBiZWZvcmUgdGhlIHF1ZXVlIGlzIGZsdXNoZWQsIHRoZXlcbiAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgaWYgKGN1c3RvbVNjaGVkdWxlckZuKSB7XG4gICAgICBjdXN0b21TY2hlZHVsZXJGbihmbHVzaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjaGVkdWxlRmx1c2goKTtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNldFNjaGVkdWxlcihzY2hlZHVsZUZuKSB7XG4gIGN1c3RvbVNjaGVkdWxlckZuID0gc2NoZWR1bGVGbjtcbn1cblxuZnVuY3Rpb24gc2V0QXNhcChhc2FwRm4pIHtcbiAgYXNhcCA9IGFzYXBGbjtcbn1cblxudmFyIGJyb3dzZXJXaW5kb3cgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbnZhciBicm93c2VyR2xvYmFsID0gYnJvd3NlcldpbmRvdyB8fCB7fTtcbnZhciBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG52YXIgaXNOb2RlID0gdHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAoe30pLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbnZhciBpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8vIG5vZGVcbmZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jdWpvanMvd2hlbi9pc3N1ZXMvNDEwIGZvciBkZXRhaWxzXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICB9O1xufVxuXG4vLyB2ZXJ0eFxuZnVuY3Rpb24gdXNlVmVydHhUaW1lcigpIHtcbiAgaWYgKHR5cGVvZiB2ZXJ0eE5leHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZlcnR4TmV4dChmbHVzaCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgbm9kZS5kYXRhID0gaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDI7XG4gIH07XG59XG5cbi8vIHdlYiB3b3JrZXJcbmZ1bmN0aW9uIHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICB9O1xufVxuXG5mdW5jdGlvbiB1c2VTZXRUaW1lb3V0KCkge1xuICAvLyBTdG9yZSBzZXRUaW1lb3V0IHJlZmVyZW5jZSBzbyBlczYtcHJvbWlzZSB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbiAgLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG4gIHZhciBnbG9iYWxTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2xvYmFsU2V0VGltZW91dChmbHVzaCwgMSk7XG4gIH07XG59XG5cbnZhciBxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbmZ1bmN0aW9uIGZsdXNoKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gcXVldWVbaV07XG4gICAgdmFyIGFyZyA9IHF1ZXVlW2kgKyAxXTtcblxuICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICBxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICBxdWV1ZVtpICsgMV0gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBhdHRlbXB0VmVydHgoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHIgPSByZXF1aXJlO1xuICAgIHZhciB2ZXJ0eCA9IF9fd2VicGFja19yZXF1aXJlX18oOSk7XG4gICAgdmVydHhOZXh0ID0gdmVydHgucnVuT25Mb29wIHx8IHZlcnR4LnJ1bk9uQ29udGV4dDtcbiAgICByZXR1cm4gdXNlVmVydHhUaW1lcigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHVzZVNldFRpbWVvdXQoKTtcbiAgfVxufVxuXG52YXIgc2NoZWR1bGVGbHVzaCA9IHVuZGVmaW5lZDtcbi8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG5pZiAoaXNOb2RlKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xufSBlbHNlIGlmIChCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTXV0YXRpb25PYnNlcnZlcigpO1xufSBlbHNlIGlmIChpc1dvcmtlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTWVzc2FnZUNoYW5uZWwoKTtcbn0gZWxzZSBpZiAoYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIFwiZnVuY3Rpb25cIiA9PT0gJ2Z1bmN0aW9uJykge1xuICBzY2hlZHVsZUZsdXNoID0gYXR0ZW1wdFZlcnR4KCk7XG59IGVsc2Uge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlU2V0VGltZW91dCgpO1xufVxuXG5mdW5jdGlvbiB0aGVuKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xuXG4gIHZhciBwYXJlbnQgPSB0aGlzO1xuXG4gIHZhciBjaGlsZCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG5vb3ApO1xuXG4gIGlmIChjaGlsZFtQUk9NSVNFX0lEXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbWFrZVByb21pc2UoY2hpbGQpO1xuICB9XG5cbiAgdmFyIF9zdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cbiAgaWYgKF9zdGF0ZSkge1xuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2FsbGJhY2sgPSBfYXJndW1lbnRzW19zdGF0ZSAtIDFdO1xuICAgICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBpbnZva2VDYWxsYmFjayhfc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcGFyZW50Ll9yZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSkoKTtcbiAgfSBlbHNlIHtcbiAgICBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICB9XG5cbiAgcmV0dXJuIGNoaWxkO1xufVxuXG4vKipcbiAgYFByb21pc2UucmVzb2x2ZWAgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSByZXNvbHZlZCB3aXRoIHRoZVxuICBwYXNzZWQgYHZhbHVlYC4gSXQgaXMgc2hvcnRoYW5kIGZvciB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlc29sdmUoMSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKDEpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVzb2x2ZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSB2YWx1ZSB2YWx1ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aFxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIGZ1bGZpbGxlZCB3aXRoIHRoZSBnaXZlblxuICBgdmFsdWVgXG4qL1xuZnVuY3Rpb24gcmVzb2x2ZSQxKG9iamVjdCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICByZXR1cm4gcHJvbWlzZTtcbn1cblxudmFyIFBST01JU0VfSUQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMTYpO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxudmFyIFBFTkRJTkcgPSB2b2lkIDA7XG52YXIgRlVMRklMTEVEID0gMTtcbnZhciBSRUpFQ1RFRCA9IDI7XG5cbnZhciBHRVRfVEhFTl9FUlJPUiA9IG5ldyBFcnJvck9iamVjdCgpO1xuXG5mdW5jdGlvbiBzZWxmRnVsZmlsbG1lbnQoKSB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbn1cblxuZnVuY3Rpb24gY2Fubm90UmV0dXJuT3duKCkge1xuICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xufVxuXG5mdW5jdGlvbiBnZXRUaGVuKHByb21pc2UpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcHJvbWlzZS50aGVuO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIEdFVF9USEVOX0VSUk9SLmVycm9yID0gZXJyb3I7XG4gICAgcmV0dXJuIEdFVF9USEVOX0VSUk9SO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeVRoZW4odGhlbiQkMSwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICB0cnkge1xuICAgIHRoZW4kJDEuY2FsbCh2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbiQkMSkge1xuICBhc2FwKGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgIHZhciBlcnJvciA9IHRyeVRoZW4odGhlbiQkMSwgdGhlbmFibGUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHNlYWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIGlmIChzZWFsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICB9XG4gIH0sIHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICBpZiAodGhlbmFibGUuX3N0YXRlID09PSBGVUxGSUxMRUQpIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICB9IGVsc2UgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICByZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIHJldHVybiByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4kJDEpIHtcbiAgaWYgKG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IgPT09IHByb21pc2UuY29uc3RydWN0b3IgJiYgdGhlbiQkMSA9PT0gdGhlbiAmJiBtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yLnJlc29sdmUgPT09IHJlc29sdmUkMSkge1xuICAgIGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGVuJCQxID09PSBHRVRfVEhFTl9FUlJPUikge1xuICAgICAgcmVqZWN0KHByb21pc2UsIEdFVF9USEVOX0VSUk9SLmVycm9yKTtcbiAgICAgIEdFVF9USEVOX0VSUk9SLmVycm9yID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHRoZW4kJDEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odGhlbiQkMSkpIHtcbiAgICAgIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgc2VsZkZ1bGZpbGxtZW50KCkpO1xuICB9IGVsc2UgaWYgKG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSwgZ2V0VGhlbih2YWx1ZSkpO1xuICB9IGVsc2Uge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgIHByb21pc2UuX29uZXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgfVxuXG4gIHB1Ymxpc2gocHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gIHByb21pc2UuX3N0YXRlID0gRlVMRklMTEVEO1xuXG4gIGlmIChwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggIT09IDApIHtcbiAgICBhc2FwKHB1Ymxpc2gsIHByb21pc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHByb21pc2UuX3N0YXRlID0gUkVKRUNURUQ7XG4gIHByb21pc2UuX3Jlc3VsdCA9IHJlYXNvbjtcblxuICBhc2FwKHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgdmFyIF9zdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gIHZhciBsZW5ndGggPSBfc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgX3N1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgX3N1YnNjcmliZXJzW2xlbmd0aCArIEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICBfc3Vic2NyaWJlcnNbbGVuZ3RoICsgUkVKRUNURURdID0gb25SZWplY3Rpb247XG5cbiAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwYXJlbnQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2gocHJvbWlzZSkge1xuICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNoaWxkID0gdW5kZWZpbmVkLFxuICAgICAgY2FsbGJhY2sgPSB1bmRlZmluZWQsXG4gICAgICBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICBpZiAoY2hpbGQpIHtcbiAgICAgIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICB9XG4gIH1cblxuICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xufVxuXG5mdW5jdGlvbiBFcnJvck9iamVjdCgpIHtcbiAgdGhpcy5lcnJvciA9IG51bGw7XG59XG5cbnZhciBUUllfQ0FUQ0hfRVJST1IgPSBuZXcgRXJyb3JPYmplY3QoKTtcblxuZnVuY3Rpb24gdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICB0cnkge1xuICAgIHJldHVybiBjYWxsYmFjayhkZXRhaWwpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICByZXR1cm4gVFJZX0NBVENIX0VSUk9SO1xuICB9XG59XG5cbmZ1bmN0aW9uIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIHByb21pc2UsIGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgdmFyIGhhc0NhbGxiYWNrID0gaXNGdW5jdGlvbihjYWxsYmFjayksXG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZCxcbiAgICAgIGVycm9yID0gdW5kZWZpbmVkLFxuICAgICAgc3VjY2VlZGVkID0gdW5kZWZpbmVkLFxuICAgICAgZmFpbGVkID0gdW5kZWZpbmVkO1xuXG4gIGlmIChoYXNDYWxsYmFjaykge1xuICAgIHZhbHVlID0gdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCk7XG5cbiAgICBpZiAodmFsdWUgPT09IFRSWV9DQVRDSF9FUlJPUikge1xuICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgIGVycm9yID0gdmFsdWUuZXJyb3I7XG4gICAgICB2YWx1ZS5lcnJvciA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICByZWplY3QocHJvbWlzZSwgY2Fubm90UmV0dXJuT3duKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IGRldGFpbDtcbiAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICB9XG5cbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgLy8gbm9vcFxuICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChmYWlsZWQpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBGVUxGSUxMRUQpIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gUkVKRUNURUQpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICB0cnkge1xuICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKSB7XG4gICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgZSk7XG4gIH1cbn1cblxudmFyIGlkID0gMDtcbmZ1bmN0aW9uIG5leHRJZCgpIHtcbiAgcmV0dXJuIGlkKys7XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKHByb21pc2UpIHtcbiAgcHJvbWlzZVtQUk9NSVNFX0lEXSA9IGlkKys7XG4gIHByb21pc2UuX3N0YXRlID0gdW5kZWZpbmVkO1xuICBwcm9taXNlLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gIHByb21pc2UuX3N1YnNjcmliZXJzID0gW107XG59XG5cbmZ1bmN0aW9uIEVudW1lcmF0b3IkMShDb25zdHJ1Y3RvciwgaW5wdXQpIHtcbiAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICB0aGlzLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaWYgKCF0aGlzLnByb21pc2VbUFJPTUlTRV9JRF0pIHtcbiAgICBtYWtlUHJvbWlzZSh0aGlzLnByb21pc2UpO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgdGhpcy5sZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gICAgdGhpcy5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcblxuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgIHRoaXMuX2VudW1lcmF0ZShpbnB1dCk7XG4gICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgIGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZWplY3QodGhpcy5wcm9taXNlLCB2YWxpZGF0aW9uRXJyb3IoKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGlvbkVycm9yKCkge1xuICByZXR1cm4gbmV3IEVycm9yKCdBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXknKTtcbn1cblxuRW51bWVyYXRvciQxLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gIGZvciAodmFyIGkgPSAwOyB0aGlzLl9zdGF0ZSA9PT0gUEVORElORyAmJiBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICB9XG59O1xuXG5FbnVtZXJhdG9yJDEucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbiAoZW50cnksIGkpIHtcbiAgdmFyIGMgPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yO1xuICB2YXIgcmVzb2x2ZSQkMSA9IGMucmVzb2x2ZTtcblxuICBpZiAocmVzb2x2ZSQkMSA9PT0gcmVzb2x2ZSQxKSB7XG4gICAgdmFyIF90aGVuID0gZ2V0VGhlbihlbnRyeSk7XG5cbiAgICBpZiAoX3RoZW4gPT09IHRoZW4gJiYgZW50cnkuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgICB0aGlzLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBfdGhlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICB0aGlzLl9yZXN1bHRbaV0gPSBlbnRyeTtcbiAgICB9IGVsc2UgaWYgKGMgPT09IFByb21pc2UkMikge1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgYyhub29wKTtcbiAgICAgIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgZW50cnksIF90aGVuKTtcbiAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChwcm9taXNlLCBpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KG5ldyBjKGZ1bmN0aW9uIChyZXNvbHZlJCQxKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlJCQxKGVudHJ5KTtcbiAgICAgIH0pLCBpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fd2lsbFNldHRsZUF0KHJlc29sdmUkJDEoZW50cnkpLCBpKTtcbiAgfVxufTtcblxuRW51bWVyYXRvciQxLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24gKHN0YXRlLCBpLCB2YWx1ZSkge1xuICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcblxuICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IFBFTkRJTkcpIHtcbiAgICB0aGlzLl9yZW1haW5pbmctLTtcblxuICAgIGlmIChzdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gIH1cbn07XG5cbkVudW1lcmF0b3IkMS5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uIChwcm9taXNlLCBpKSB7XG4gIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICBzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gZW51bWVyYXRvci5fc2V0dGxlZEF0KEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuIGVudW1lcmF0b3IuX3NldHRsZWRBdChSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgfSk7XG59O1xuXG4vKipcbiAgYFByb21pc2UuYWxsYCBhY2NlcHRzIGFuIGFycmF5IG9mIHByb21pc2VzLCBhbmQgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoXG4gIGlzIGZ1bGZpbGxlZCB3aXRoIGFuIGFycmF5IG9mIGZ1bGZpbGxtZW50IHZhbHVlcyBmb3IgdGhlIHBhc3NlZCBwcm9taXNlcywgb3JcbiAgcmVqZWN0ZWQgd2l0aCB0aGUgcmVhc29uIG9mIHRoZSBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBiZSByZWplY3RlZC4gSXQgY2FzdHMgYWxsXG4gIGVsZW1lbnRzIG9mIHRoZSBwYXNzZWQgaXRlcmFibGUgdG8gcHJvbWlzZXMgYXMgaXQgcnVucyB0aGlzIGFsZ29yaXRobS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVzb2x2ZSgyKTtcbiAgbGV0IHByb21pc2UzID0gcmVzb2x2ZSgzKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIFRoZSBhcnJheSBoZXJlIHdvdWxkIGJlIFsgMSwgMiwgMyBdO1xuICB9KTtcbiAgYGBgXG5cbiAgSWYgYW55IG9mIHRoZSBgcHJvbWlzZXNgIGdpdmVuIHRvIGBhbGxgIGFyZSByZWplY3RlZCwgdGhlIGZpcnN0IHByb21pc2VcbiAgdGhhdCBpcyByZWplY3RlZCB3aWxsIGJlIGdpdmVuIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSByZXR1cm5lZCBwcm9taXNlcydzXG4gIHJlamVjdGlvbiBoYW5kbGVyLiBGb3IgZXhhbXBsZTpcblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVqZWN0KG5ldyBFcnJvcihcIjJcIikpO1xuICBsZXQgcHJvbWlzZTMgPSByZWplY3QobmV3IEVycm9yKFwiM1wiKSk7XG4gIGxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuXG4gIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAvLyBlcnJvci5tZXNzYWdlID09PSBcIjJcIlxuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCBhbGxcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FycmF5fSBlbnRyaWVzIGFycmF5IG9mIHByb21pc2VzXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiBhbGwgYHByb21pc2VzYCBoYXZlIGJlZW5cbiAgZnVsZmlsbGVkLCBvciByZWplY3RlZCBpZiBhbnkgb2YgdGhlbSBiZWNvbWUgcmVqZWN0ZWQuXG4gIEBzdGF0aWNcbiovXG5mdW5jdGlvbiBhbGwkMShlbnRyaWVzKSB7XG4gIHJldHVybiBuZXcgRW51bWVyYXRvciQxKHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG59XG5cbi8qKlxuICBgUHJvbWlzZS5yYWNlYCByZXR1cm5zIGEgbmV3IHByb21pc2Ugd2hpY2ggaXMgc2V0dGxlZCBpbiB0aGUgc2FtZSB3YXkgYXMgdGhlXG4gIGZpcnN0IHBhc3NlZCBwcm9taXNlIHRvIHNldHRsZS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDEnKTtcbiAgICB9LCAyMDApO1xuICB9KTtcblxuICBsZXQgcHJvbWlzZTIgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMicpO1xuICAgIH0sIDEwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIHJlc3VsdCA9PT0gJ3Byb21pc2UgMicgYmVjYXVzZSBpdCB3YXMgcmVzb2x2ZWQgYmVmb3JlIHByb21pc2UxXG4gICAgLy8gd2FzIHJlc29sdmVkLlxuICB9KTtcbiAgYGBgXG5cbiAgYFByb21pc2UucmFjZWAgaXMgZGV0ZXJtaW5pc3RpYyBpbiB0aGF0IG9ubHkgdGhlIHN0YXRlIG9mIHRoZSBmaXJzdFxuICBzZXR0bGVkIHByb21pc2UgbWF0dGVycy4gRm9yIGV4YW1wbGUsIGV2ZW4gaWYgb3RoZXIgcHJvbWlzZXMgZ2l2ZW4gdG8gdGhlXG4gIGBwcm9taXNlc2AgYXJyYXkgYXJndW1lbnQgYXJlIHJlc29sdmVkLCBidXQgdGhlIGZpcnN0IHNldHRsZWQgcHJvbWlzZSBoYXNcbiAgYmVjb21lIHJlamVjdGVkIGJlZm9yZSB0aGUgb3RoZXIgcHJvbWlzZXMgYmVjYW1lIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gIHByb21pc2Ugd2lsbCBiZWNvbWUgcmVqZWN0ZWQ6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMScpO1xuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIGxldCBwcm9taXNlMiA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcigncHJvbWlzZSAyJykpO1xuICAgIH0sIDEwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdwcm9taXNlIDInIGJlY2F1c2UgcHJvbWlzZSAyIGJlY2FtZSByZWplY3RlZCBiZWZvcmVcbiAgICAvLyBwcm9taXNlIDEgYmVjYW1lIGZ1bGZpbGxlZFxuICB9KTtcbiAgYGBgXG5cbiAgQW4gZXhhbXBsZSByZWFsLXdvcmxkIHVzZSBjYXNlIGlzIGltcGxlbWVudGluZyB0aW1lb3V0czpcblxuICBgYGBqYXZhc2NyaXB0XG4gIFByb21pc2UucmFjZShbYWpheCgnZm9vLmpzb24nKSwgdGltZW91dCg1MDAwKV0pXG4gIGBgYFxuXG4gIEBtZXRob2QgcmFjZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7QXJyYXl9IHByb21pc2VzIGFycmF5IG9mIHByb21pc2VzIHRvIG9ic2VydmVcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2Ugd2hpY2ggc2V0dGxlcyBpbiB0aGUgc2FtZSB3YXkgYXMgdGhlIGZpcnN0IHBhc3NlZFxuICBwcm9taXNlIHRvIHNldHRsZS5cbiovXG5mdW5jdGlvbiByYWNlJDEoZW50cmllcykge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmICghaXNBcnJheShlbnRyaWVzKSkge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKF8sIHJlamVjdCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAgYFByb21pc2UucmVqZWN0YCByZXR1cm5zIGEgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSBwYXNzZWQgYHJlYXNvbmAuXG4gIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignV0hPT1BTJykpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHJlamVjdFxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSByZWFzb24gdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGguXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIGdpdmVuIGByZWFzb25gLlxuKi9cbmZ1bmN0aW9uIHJlamVjdCQxKHJlYXNvbikge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBuZWVkc1Jlc29sdmVyKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG59XG5cbmZ1bmN0aW9uIG5lZWRzTmV3KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xufVxuXG4vKipcbiAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgVGVybWlub2xvZ3lcbiAgLS0tLS0tLS0tLS1cblxuICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICBCYXNpYyBVc2FnZTpcbiAgLS0tLS0tLS0tLS0tXG5cbiAgYGBganNcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBvbiBzdWNjZXNzXG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAvLyBvbiBmYWlsdXJlXG4gICAgcmVqZWN0KHJlYXNvbik7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIC8vIG9uIHJlamVjdGlvblxuICB9KTtcbiAgYGBgXG5cbiAgQWR2YW5jZWQgVXNhZ2U6XG4gIC0tLS0tLS0tLS0tLS0tLVxuXG4gIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgYGBganNcbiAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gb24gcmVqZWN0aW9uXG4gIH0pO1xuICBgYGBcblxuICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gIGBgYGpzXG4gIFByb21pc2UuYWxsKFtcbiAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0pO1xuICBgYGBcblxuICBAY2xhc3MgUHJvbWlzZVxuICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEBjb25zdHJ1Y3RvclxuKi9cbmZ1bmN0aW9uIFByb21pc2UkMihyZXNvbHZlcikge1xuICB0aGlzW1BST01JU0VfSURdID0gbmV4dElkKCk7XG4gIHRoaXMuX3Jlc3VsdCA9IHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gIGlmIChub29wICE9PSByZXNvbHZlcikge1xuICAgIHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJyAmJiBuZWVkc1Jlc29sdmVyKCk7XG4gICAgdGhpcyBpbnN0YW5jZW9mIFByb21pc2UkMiA/IGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKSA6IG5lZWRzTmV3KCk7XG4gIH1cbn1cblxuUHJvbWlzZSQyLmFsbCA9IGFsbCQxO1xuUHJvbWlzZSQyLnJhY2UgPSByYWNlJDE7XG5Qcm9taXNlJDIucmVzb2x2ZSA9IHJlc29sdmUkMTtcblByb21pc2UkMi5yZWplY3QgPSByZWplY3QkMTtcblByb21pc2UkMi5fc2V0U2NoZWR1bGVyID0gc2V0U2NoZWR1bGVyO1xuUHJvbWlzZSQyLl9zZXRBc2FwID0gc2V0QXNhcDtcblByb21pc2UkMi5fYXNhcCA9IGFzYXA7XG5cblByb21pc2UkMi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBQcm9taXNlJDIsXG5cbiAgLyoqXG4gICAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG4gIFxuICAgIGBgYGpzXG4gICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgICB9KTtcbiAgICBgYGBcbiAgXG4gICAgQ2hhaW5pbmdcbiAgICAtLS0tLS0tLVxuICBcbiAgICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cbiAgXG4gICAgYGBganNcbiAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgICB9KTtcbiAgXG4gICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gICAgfSk7XG4gICAgYGBgXG4gICAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG4gIFxuICAgIGBgYGpzXG4gICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gICAgfSk7XG4gICAgYGBgXG4gIFxuICAgIEFzc2ltaWxhdGlvblxuICAgIC0tLS0tLS0tLS0tLVxuICBcbiAgICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICAgIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gICAgfSk7XG4gICAgYGBgXG4gIFxuICAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICAgIH0pO1xuICAgIGBgYFxuICBcbiAgICBTaW1wbGUgRXhhbXBsZVxuICAgIC0tLS0tLS0tLS0tLS0tXG4gIFxuICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcbiAgXG4gICAgYGBgamF2YXNjcmlwdFxuICAgIGxldCByZXN1bHQ7XG4gIFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAvLyBzdWNjZXNzXG4gICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgIC8vIGZhaWx1cmVcbiAgICB9XG4gICAgYGBgXG4gIFxuICAgIEVycmJhY2sgRXhhbXBsZVxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgaWYgKGVycikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9XG4gICAgfSk7XG4gICAgYGBgXG4gIFxuICAgIFByb21pc2UgRXhhbXBsZTtcbiAgXG4gICAgYGBgamF2YXNjcmlwdFxuICAgIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAvLyBzdWNjZXNzXG4gICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgIC8vIGZhaWx1cmVcbiAgICB9KTtcbiAgICBgYGBcbiAgXG4gICAgQWR2YW5jZWQgRXhhbXBsZVxuICAgIC0tLS0tLS0tLS0tLS0tXG4gIFxuICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcbiAgXG4gICAgYGBgamF2YXNjcmlwdFxuICAgIGxldCBhdXRob3IsIGJvb2tzO1xuICBcbiAgICB0cnkge1xuICAgICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgLy8gZmFpbHVyZVxuICAgIH1cbiAgICBgYGBcbiAgXG4gICAgRXJyYmFjayBFeGFtcGxlXG4gIFxuICAgIGBgYGpzXG4gIFxuICAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcbiAgXG4gICAgfVxuICBcbiAgICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuICBcbiAgICB9XG4gIFxuICAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH1cbiAgICB9KTtcbiAgICBgYGBcbiAgXG4gICAgUHJvbWlzZSBFeGFtcGxlO1xuICBcbiAgICBgYGBqYXZhc2NyaXB0XG4gICAgZmluZEF1dGhvcigpLlxuICAgICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgLy8gZm91bmQgYm9va3NcbiAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICB9KTtcbiAgICBgYGBcbiAgXG4gICAgQG1ldGhvZCB0aGVuXG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG4gIHRoZW46IHRoZW4sXG5cbiAgLyoqXG4gICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgIGFzIHRoZSBjYXRjaCBibG9jayBvZiBhIHRyeS9jYXRjaCBzdGF0ZW1lbnQuXG4gIFxuICAgIGBgYGpzXG4gICAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgfVxuICBcbiAgICAvLyBzeW5jaHJvbm91c1xuICAgIHRyeSB7XG4gICAgICBmaW5kQXV0aG9yKCk7XG4gICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgfVxuICBcbiAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgIH0pO1xuICAgIGBgYFxuICBcbiAgICBAbWV0aG9kIGNhdGNoXG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cbiAgJ2NhdGNoJzogZnVuY3Rpb24gX2NhdGNoKG9uUmVqZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbik7XG4gIH1cbn07XG5cbi8qZ2xvYmFsIHNlbGYqL1xuZnVuY3Rpb24gcG9seWZpbGwkMSgpIHtcbiAgICB2YXIgbG9jYWwgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbG9jYWwgPSBnbG9iYWw7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbG9jYWwgPSBzZWxmO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbCA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgICBpZiAoUCkge1xuICAgICAgICB2YXIgcHJvbWlzZVRvU3RyaW5nID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb21pc2VUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIHNpbGVudGx5IGlnbm9yZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9taXNlVG9TdHJpbmcgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2NhbC5Qcm9taXNlID0gUHJvbWlzZSQyO1xufVxuXG4vLyBTdHJhbmdlIGNvbXBhdC4uXG5Qcm9taXNlJDIucG9seWZpbGwgPSBwb2x5ZmlsbCQxO1xuUHJvbWlzZSQyLlByb21pc2UgPSBQcm9taXNlJDI7XG5cbnJldHVybiBQcm9taXNlJDI7XG5cbn0pKSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVzNi1wcm9taXNlLm1hcFxuXG4vKiBXRUJQQUNLIFZBUiBJTkpFQ1RJT04gKi99LmNhbGwoZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyg3KSwgX193ZWJwYWNrX3JlcXVpcmVfXyg4KSkpXG5cbi8qKiovIH0pLFxuLyogNSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4vLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG4vKioqLyB9KSxcbi8qIDYgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLyogZ2xvYmFsIFZFUlNJT04gKi9cblxuX193ZWJwYWNrX3JlcXVpcmVfXyg1KTtcblxudmFyIF9lczZQcm9taXNlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0KTtcblxudmFyIF9lczZQcm9taXNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2VzNlByb21pc2UpO1xuXG52YXIgX3V0aWxzID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX3V0aWxzKTtcblxudmFyIF9hcGkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xuXG52YXIgQVBJID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2FwaSk7XG5cbnZhciBfYnV0dG9uID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcblxudmFyIF9wdXNoID0gX193ZWJwYWNrX3JlcXVpcmVfXygzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09iai5kZWZhdWx0ID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE5vdHkgPSBmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtOb3R5fVxuICAgKi9cbiAgZnVuY3Rpb24gTm90eSgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTm90eSk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBVdGlscy5kZWVwRXh0ZW5kKHt9LCBBUEkuRGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgaWYgKEFQSS5TdG9yZVt0aGlzLm9wdGlvbnMuaWRdKSB7XG4gICAgICByZXR1cm4gQVBJLlN0b3JlW3RoaXMub3B0aW9ucy5pZF07XG4gICAgfVxuXG4gICAgdGhpcy5pZCA9IHRoaXMub3B0aW9ucy5pZCB8fCBVdGlscy5nZW5lcmF0ZUlEKCdiYXInKTtcbiAgICB0aGlzLmNsb3NlVGltZXIgPSAtMTtcbiAgICB0aGlzLmJhckRvbSA9IG51bGw7XG4gICAgdGhpcy5sYXlvdXREb20gPSBudWxsO1xuICAgIHRoaXMucHJvZ3Jlc3NEb20gPSBudWxsO1xuICAgIHRoaXMuc2hvd2luZyA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd24gPSBmYWxzZTtcbiAgICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuY2xvc2luZyA9IGZhbHNlO1xuICAgIHRoaXMua2lsbGFibGUgPSB0aGlzLm9wdGlvbnMudGltZW91dCB8fCB0aGlzLm9wdGlvbnMuY2xvc2VXaXRoLmxlbmd0aCA+IDA7XG4gICAgdGhpcy5oYXNTb3VuZCA9IHRoaXMub3B0aW9ucy5zb3VuZHMuc291cmNlcy5sZW5ndGggPiAwO1xuICAgIHRoaXMuc291bmRQbGF5ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHtcbiAgICAgIGJlZm9yZVNob3c6IFtdLFxuICAgICAgb25TaG93OiBbXSxcbiAgICAgIGFmdGVyU2hvdzogW10sXG4gICAgICBvbkNsb3NlOiBbXSxcbiAgICAgIGFmdGVyQ2xvc2U6IFtdLFxuICAgICAgb25DbGljazogW10sXG4gICAgICBvbkhvdmVyOiBbXSxcbiAgICAgIG9uVGVtcGxhdGU6IFtdXG4gICAgfTtcbiAgICB0aGlzLnByb21pc2VzID0ge1xuICAgICAgc2hvdzogbnVsbCxcbiAgICAgIGNsb3NlOiBudWxsXG4gICAgfTtcbiAgICB0aGlzLm9uKCdiZWZvcmVTaG93JywgdGhpcy5vcHRpb25zLmNhbGxiYWNrcy5iZWZvcmVTaG93KTtcbiAgICB0aGlzLm9uKCdvblNob3cnLCB0aGlzLm9wdGlvbnMuY2FsbGJhY2tzLm9uU2hvdyk7XG4gICAgdGhpcy5vbignYWZ0ZXJTaG93JywgdGhpcy5vcHRpb25zLmNhbGxiYWNrcy5hZnRlclNob3cpO1xuICAgIHRoaXMub24oJ29uQ2xvc2UnLCB0aGlzLm9wdGlvbnMuY2FsbGJhY2tzLm9uQ2xvc2UpO1xuICAgIHRoaXMub24oJ2FmdGVyQ2xvc2UnLCB0aGlzLm9wdGlvbnMuY2FsbGJhY2tzLmFmdGVyQ2xvc2UpO1xuICAgIHRoaXMub24oJ29uQ2xpY2snLCB0aGlzLm9wdGlvbnMuY2FsbGJhY2tzLm9uQ2xpY2spO1xuICAgIHRoaXMub24oJ29uSG92ZXInLCB0aGlzLm9wdGlvbnMuY2FsbGJhY2tzLm9uSG92ZXIpO1xuICAgIHRoaXMub24oJ29uVGVtcGxhdGUnLCB0aGlzLm9wdGlvbnMuY2FsbGJhY2tzLm9uVGVtcGxhdGUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYlxuICAgKiBAcmV0dXJuIHtOb3R5fVxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhOb3R5LCBbe1xuICAgIGtleTogJ29uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb24oZXZlbnROYW1lKSB7XG4gICAgICB2YXIgY2IgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIHRoaXMubGlzdGVuZXJzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnROYW1lXS5wdXNoKGNiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7Tm90eX1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc2hvdycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5zaG93aW5nIHx8IHRoaXMuc2hvd24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7IC8vIHByZXZlbnRpbmcgbXVsdGlwbGUgc2hvd1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmtpbGxlciA9PT0gdHJ1ZSkge1xuICAgICAgICBOb3R5LmNsb3NlQWxsKCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMua2lsbGVyID09PSAnc3RyaW5nJykge1xuICAgICAgICBOb3R5LmNsb3NlQWxsKHRoaXMub3B0aW9ucy5raWxsZXIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcXVldWVDb3VudHMgPSBBUEkuZ2V0UXVldWVDb3VudHModGhpcy5vcHRpb25zLnF1ZXVlKTtcblxuICAgICAgaWYgKHF1ZXVlQ291bnRzLmN1cnJlbnQgPj0gcXVldWVDb3VudHMubWF4VmlzaWJsZSB8fCBBUEkuUGFnZUhpZGRlbiAmJiB0aGlzLm9wdGlvbnMudmlzaWJpbGl0eUNvbnRyb2wpIHtcbiAgICAgICAgQVBJLmFkZFRvUXVldWUodGhpcyk7XG5cbiAgICAgICAgaWYgKEFQSS5QYWdlSGlkZGVuICYmIHRoaXMuaGFzU291bmQgJiYgVXRpbHMuaW5BcnJheSgnZG9jSGlkZGVuJywgdGhpcy5vcHRpb25zLnNvdW5kcy5jb25kaXRpb25zKSkge1xuICAgICAgICAgIFV0aWxzLmNyZWF0ZUF1ZGlvRWxlbWVudHModGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQVBJLlBhZ2VIaWRkZW4gJiYgVXRpbHMuaW5BcnJheSgnZG9jSGlkZGVuJywgdGhpcy5vcHRpb25zLnRpdGxlQ291bnQuY29uZGl0aW9ucykpIHtcbiAgICAgICAgICBBUEkuZG9jVGl0bGUuaW5jcmVtZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgQVBJLlN0b3JlW3RoaXMuaWRdID0gdGhpcztcblxuICAgICAgQVBJLmZpcmUodGhpcywgJ2JlZm9yZVNob3cnKTtcblxuICAgICAgdGhpcy5zaG93aW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKHRoaXMuY2xvc2luZykge1xuICAgICAgICB0aGlzLnNob3dpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIEFQSS5idWlsZCh0aGlzKTtcbiAgICAgIEFQSS5oYW5kbGVNb2RhbCh0aGlzKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZSkge1xuICAgICAgICB0aGlzLmxheW91dERvbS5pbnNlcnRCZWZvcmUodGhpcy5iYXJEb20sIHRoaXMubGF5b3V0RG9tLmZpcnN0Q2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sYXlvdXREb20uYXBwZW5kQ2hpbGQodGhpcy5iYXJEb20pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5oYXNTb3VuZCAmJiAhdGhpcy5zb3VuZFBsYXllZCAmJiBVdGlscy5pbkFycmF5KCdkb2NWaXNpYmxlJywgdGhpcy5vcHRpb25zLnNvdW5kcy5jb25kaXRpb25zKSkge1xuICAgICAgICBVdGlscy5jcmVhdGVBdWRpb0VsZW1lbnRzKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoVXRpbHMuaW5BcnJheSgnZG9jVmlzaWJsZScsIHRoaXMub3B0aW9ucy50aXRsZUNvdW50LmNvbmRpdGlvbnMpKSB7XG4gICAgICAgIEFQSS5kb2NUaXRsZS5pbmNyZW1lbnQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zaG93biA9IHRydWU7XG4gICAgICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xuXG4gICAgICAvLyBiaW5kIGJ1dHRvbiBldmVudHMgaWYgYW55XG4gICAgICBpZiAoQVBJLmhhc0J1dHRvbnModGhpcykpIHtcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5vcHRpb25zLmJ1dHRvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHZhciBidG4gPSBfdGhpcy5iYXJEb20ucXVlcnlTZWxlY3RvcignIycgKyBfdGhpcy5vcHRpb25zLmJ1dHRvbnNba2V5XS5pZCk7XG4gICAgICAgICAgVXRpbHMuYWRkTGlzdGVuZXIoYnRuLCAnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgVXRpbHMuc3RvcFByb3BhZ2F0aW9uKGUpO1xuICAgICAgICAgICAgX3RoaXMub3B0aW9ucy5idXR0b25zW2tleV0uY2IoX3RoaXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm9ncmVzc0RvbSA9IHRoaXMuYmFyRG9tLnF1ZXJ5U2VsZWN0b3IoJy5ub3R5X3Byb2dyZXNzYmFyJyk7XG5cbiAgICAgIGlmIChVdGlscy5pbkFycmF5KCdjbGljaycsIHRoaXMub3B0aW9ucy5jbG9zZVdpdGgpKSB7XG4gICAgICAgIFV0aWxzLmFkZENsYXNzKHRoaXMuYmFyRG9tLCAnbm90eV9jbG9zZV93aXRoX2NsaWNrJyk7XG4gICAgICAgIFV0aWxzLmFkZExpc3RlbmVyKHRoaXMuYmFyRG9tLCAnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIFV0aWxzLnN0b3BQcm9wYWdhdGlvbihlKTtcbiAgICAgICAgICBBUEkuZmlyZShfdGhpcywgJ29uQ2xpY2snKTtcbiAgICAgICAgICBfdGhpcy5jbG9zZSgpO1xuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIFV0aWxzLmFkZExpc3RlbmVyKHRoaXMuYmFyRG9tLCAnbW91c2VlbnRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQVBJLmZpcmUoX3RoaXMsICdvbkhvdmVyJyk7XG4gICAgICB9LCBmYWxzZSk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudGltZW91dCkgVXRpbHMuYWRkQ2xhc3ModGhpcy5iYXJEb20sICdub3R5X2hhc190aW1lb3V0Jyk7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnByb2dyZXNzQmFyKSB7XG4gICAgICAgIFV0aWxzLmFkZENsYXNzKHRoaXMuYmFyRG9tLCAnbm90eV9oYXNfcHJvZ3Jlc3NiYXInKTtcbiAgICAgIH1cblxuICAgICAgaWYgKFV0aWxzLmluQXJyYXkoJ2J1dHRvbicsIHRoaXMub3B0aW9ucy5jbG9zZVdpdGgpKSB7XG4gICAgICAgIFV0aWxzLmFkZENsYXNzKHRoaXMuYmFyRG9tLCAnbm90eV9jbG9zZV93aXRoX2J1dHRvbicpO1xuXG4gICAgICAgIHZhciBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBVdGlscy5hZGRDbGFzcyhjbG9zZUJ1dHRvbiwgJ25vdHlfY2xvc2VfYnV0dG9uJyk7XG4gICAgICAgIGNsb3NlQnV0dG9uLmlubmVySFRNTCA9ICfDlyc7XG4gICAgICAgIHRoaXMuYmFyRG9tLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcblxuICAgICAgICBVdGlscy5hZGRMaXN0ZW5lcihjbG9zZUJ1dHRvbiwgJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBVdGlscy5zdG9wUHJvcGFnYXRpb24oZSk7XG4gICAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICBBUEkuZmlyZSh0aGlzLCAnb25TaG93Jyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4gPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5wcm9taXNlcy5zaG93ID0gbmV3IF9lczZQcm9taXNlMi5kZWZhdWx0KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5hbmltYXRpb24ub3BlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnByb21pc2VzLnNob3cgPSBuZXcgX2VzNlByb21pc2UyLmRlZmF1bHQodGhpcy5vcHRpb25zLmFuaW1hdGlvbi5vcGVuLmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgVXRpbHMuYWRkQ2xhc3ModGhpcy5iYXJEb20sIHRoaXMub3B0aW9ucy5hbmltYXRpb24ub3Blbik7XG4gICAgICAgIHRoaXMucHJvbWlzZXMuc2hvdyA9IG5ldyBfZXM2UHJvbWlzZTIuZGVmYXVsdChmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgIFV0aWxzLmFkZExpc3RlbmVyKF90aGlzLmJhckRvbSwgVXRpbHMuYW5pbWF0aW9uRW5kRXZlbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBVdGlscy5yZW1vdmVDbGFzcyhfdGhpcy5iYXJEb20sIF90aGlzLm9wdGlvbnMuYW5pbWF0aW9uLm9wZW4pO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm9taXNlcy5zaG93LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3QgPSBfdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgQVBJLm9wZW5GbG93KF90KTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtOb3R5fVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdzdG9wJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIEFQSS5kZXF1ZXVlQ2xvc2UodGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtOb3R5fVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZXN1bWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXN1bWUoKSB7XG4gICAgICBBUEkucXVldWVDbG9zZSh0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7aW50fGJvb2xlYW59IG1zXG4gICAgICogQHJldHVybiB7Tm90eX1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc2V0VGltZW91dCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIChfc2V0VGltZW91dCkge1xuICAgICAgZnVuY3Rpb24gc2V0VGltZW91dChfeCkge1xuICAgICAgICByZXR1cm4gX3NldFRpbWVvdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgc2V0VGltZW91dC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9zZXRUaW1lb3V0LnRvU3RyaW5nKCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gc2V0VGltZW91dDtcbiAgICB9KGZ1bmN0aW9uIChtcykge1xuICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICB0aGlzLm9wdGlvbnMudGltZW91dCA9IG1zO1xuXG4gICAgICBpZiAodGhpcy5iYXJEb20pIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aW1lb3V0KSB7XG4gICAgICAgICAgVXRpbHMuYWRkQ2xhc3ModGhpcy5iYXJEb20sICdub3R5X2hhc190aW1lb3V0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgVXRpbHMucmVtb3ZlQ2xhc3ModGhpcy5iYXJEb20sICdub3R5X2hhc190aW1lb3V0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3QgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyB1Z2x5IGZpeCBmb3IgcHJvZ3Jlc3NiYXIgZGlzcGxheSBidWdcbiAgICAgICAgICBfdC5yZXN1bWUoKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSlcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gICAgICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zT3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJuIHtOb3R5fVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRUZXh0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VGV4dChodG1sKSB7XG4gICAgICB2YXIgb3B0aW9uc092ZXJyaWRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblxuICAgICAgaWYgKHRoaXMuYmFyRG9tKSB7XG4gICAgICAgIHRoaXMuYmFyRG9tLnF1ZXJ5U2VsZWN0b3IoJy5ub3R5X2JvZHknKS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9uc092ZXJyaWRlKSB0aGlzLm9wdGlvbnMudGV4dCA9IGh0bWw7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zT3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJuIHtOb3R5fVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRUeXBlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VHlwZSh0eXBlKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdmFyIG9wdGlvbnNPdmVycmlkZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgICAgIGlmICh0aGlzLmJhckRvbSkge1xuICAgICAgICB2YXIgY2xhc3NMaXN0ID0gVXRpbHMuY2xhc3NMaXN0KHRoaXMuYmFyRG9tKS5zcGxpdCgnICcpO1xuXG4gICAgICAgIGNsYXNzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgaWYgKGMuc3Vic3RyaW5nKDAsIDExKSA9PT0gJ25vdHlfdHlwZV9fJykge1xuICAgICAgICAgICAgVXRpbHMucmVtb3ZlQ2xhc3MoX3RoaXMyLmJhckRvbSwgYyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBVdGlscy5hZGRDbGFzcyh0aGlzLmJhckRvbSwgJ25vdHlfdHlwZV9fJyArIHR5cGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9uc092ZXJyaWRlKSB0aGlzLm9wdGlvbnMudHlwZSA9IHR5cGU7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aGVtZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9uc092ZXJyaWRlXG4gICAgICogQHJldHVybiB7Tm90eX1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc2V0VGhlbWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRUaGVtZSh0aGVtZSkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIHZhciBvcHRpb25zT3ZlcnJpZGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gICAgICBpZiAodGhpcy5iYXJEb20pIHtcbiAgICAgICAgdmFyIGNsYXNzTGlzdCA9IFV0aWxzLmNsYXNzTGlzdCh0aGlzLmJhckRvbSkuc3BsaXQoJyAnKTtcblxuICAgICAgICBjbGFzc0xpc3QuZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgIGlmIChjLnN1YnN0cmluZygwLCAxMikgPT09ICdub3R5X3RoZW1lX18nKSB7XG4gICAgICAgICAgICBVdGlscy5yZW1vdmVDbGFzcyhfdGhpczMuYmFyRG9tLCBjKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFV0aWxzLmFkZENsYXNzKHRoaXMuYmFyRG9tLCAnbm90eV90aGVtZV9fJyArIHRoZW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnNPdmVycmlkZSkgdGhpcy5vcHRpb25zLnRoZW1lID0gdGhlbWU7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge05vdHl9XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMuY2xvc2VkKSByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKCF0aGlzLnNob3duKSB7XG4gICAgICAgIC8vIGl0J3MgaW4gdGhlIHF1ZXVlXG4gICAgICAgIEFQSS5yZW1vdmVGcm9tUXVldWUodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBBUEkuZmlyZSh0aGlzLCAnb25DbG9zZScpO1xuXG4gICAgICB0aGlzLmNsb3NpbmcgPSB0cnVlO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbi5jbG9zZSA9PT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLnByb21pc2VzLmNsb3NlID0gbmV3IF9lczZQcm9taXNlMi5kZWZhdWx0KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5hbmltYXRpb24uY2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5wcm9taXNlcy5jbG9zZSA9IG5ldyBfZXM2UHJvbWlzZTIuZGVmYXVsdCh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uLmNsb3NlLmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgVXRpbHMuYWRkQ2xhc3ModGhpcy5iYXJEb20sIHRoaXMub3B0aW9ucy5hbmltYXRpb24uY2xvc2UpO1xuICAgICAgICB0aGlzLnByb21pc2VzLmNsb3NlID0gbmV3IF9lczZQcm9taXNlMi5kZWZhdWx0KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgVXRpbHMuYWRkTGlzdGVuZXIoX3RoaXM0LmJhckRvbSwgVXRpbHMuYW5pbWF0aW9uRW5kRXZlbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXM0Lm9wdGlvbnMuZm9yY2UpIHtcbiAgICAgICAgICAgICAgVXRpbHMucmVtb3ZlKF90aGlzNC5iYXJEb20pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgQVBJLmdob3N0Rml4KF90aGlzNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb21pc2VzLmNsb3NlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBBUEkuY2xvc2VGbG93KF90aGlzNCk7XG4gICAgICAgIEFQSS5oYW5kbGVNb2RhbENsb3NlKF90aGlzNCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBBUEkgZnVuY3Rpb25zXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBxdWV1ZU5hbWVcbiAgICAgKiBAcmV0dXJuIHtOb3R5fVxuICAgICAqL1xuXG4gIH1dLCBbe1xuICAgIGtleTogJ2Nsb3NlQWxsJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2VBbGwoKSB7XG4gICAgICB2YXIgcXVldWVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBmYWxzZTtcblxuICAgICAgT2JqZWN0LmtleXMoQVBJLlN0b3JlKS5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBpZiAocXVldWVOYW1lKSB7XG4gICAgICAgICAgaWYgKEFQSS5TdG9yZVtpZF0ub3B0aW9ucy5xdWV1ZSA9PT0gcXVldWVOYW1lICYmIEFQSS5TdG9yZVtpZF0ua2lsbGFibGUpIHtcbiAgICAgICAgICAgIEFQSS5TdG9yZVtpZF0uY2xvc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoQVBJLlN0b3JlW2lkXS5raWxsYWJsZSkge1xuICAgICAgICAgIEFQSS5TdG9yZVtpZF0uY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVldWVOYW1lXG4gICAgICogQHJldHVybiB7Tm90eX1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnY2xlYXJRdWV1ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyUXVldWUoKSB7XG4gICAgICB2YXIgcXVldWVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnZ2xvYmFsJztcblxuICAgICAgaWYgKEFQSS5RdWV1ZXMuaGFzT3duUHJvcGVydHkocXVldWVOYW1lKSkge1xuICAgICAgICBBUEkuUXVldWVzW3F1ZXVlTmFtZV0ucXVldWUgPSBbXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge0FQSS5RdWV1ZXN9XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ292ZXJyaWRlRGVmYXVsdHMnLFxuXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gICAgICogQHJldHVybiB7Tm90eX1cbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gb3ZlcnJpZGVEZWZhdWx0cyhvYmopIHtcbiAgICAgIEFQSS5EZWZhdWx0cyA9IFV0aWxzLmRlZXBFeHRlbmQoe30sIEFQSS5EZWZhdWx0cywgb2JqKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7aW50fSBhbW91bnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVldWVOYW1lXG4gICAgICogQHJldHVybiB7Tm90eX1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc2V0TWF4VmlzaWJsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldE1heFZpc2libGUoKSB7XG4gICAgICB2YXIgYW1vdW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBBUEkuRGVmYXVsdE1heFZpc2libGU7XG4gICAgICB2YXIgcXVldWVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnZ2xvYmFsJztcblxuICAgICAgaWYgKCFBUEkuUXVldWVzLmhhc093blByb3BlcnR5KHF1ZXVlTmFtZSkpIHtcbiAgICAgICAgQVBJLlF1ZXVlc1txdWV1ZU5hbWVdID0geyBtYXhWaXNpYmxlOiBhbW91bnQsIHF1ZXVlOiBbXSB9O1xuICAgICAgfVxuXG4gICAgICBBUEkuUXVldWVzW3F1ZXVlTmFtZV0ubWF4VmlzaWJsZSA9IGFtb3VudDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbm5lckh0bWxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3Nlc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtOb3R5QnV0dG9ufVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdidXR0b24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBidXR0b24oaW5uZXJIdG1sKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgICAgIHZhciBjYiA9IGFyZ3VtZW50c1syXTtcbiAgICAgIHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiB7fTtcblxuICAgICAgcmV0dXJuIG5ldyBfYnV0dG9uLk5vdHlCdXR0b24oaW5uZXJIdG1sLCBjbGFzc2VzLCBjYiwgYXR0cmlidXRlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICd2ZXJzaW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdmVyc2lvbigpIHtcbiAgICAgIHJldHVybiBcIjMuMi4wLWJldGFcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gd29ya2VyUGF0aFxuICAgICAqIEByZXR1cm4ge1B1c2h9XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ1B1c2gnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBQdXNoKHdvcmtlclBhdGgpIHtcbiAgICAgIHJldHVybiBuZXcgX3B1c2guUHVzaCh3b3JrZXJQYXRoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdRdWV1ZXMnLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEFQSS5RdWV1ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7QVBJLlBhZ2VIaWRkZW59XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ1BhZ2VIaWRkZW4nLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEFQSS5QYWdlSGlkZGVuO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBOb3R5O1xufSgpO1xuXG4vLyBEb2N1bWVudCB2aXNpYmlsaXR5IGNoYW5nZSBjb250cm9sbGVyXG5cblxuZXhwb3J0cy5kZWZhdWx0ID0gTm90eTtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICBVdGlscy52aXNpYmlsaXR5Q2hhbmdlRmxvdygpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbi8qKiovIH0pLFxuLyogNyAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuXG5cbi8qKiovIH0pLFxuLyogOCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG52YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuLyoqKi8gfSksXG4vKiA5ICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbi8qIChpZ25vcmVkKSAqL1xuXG4vKioqLyB9KVxuLyoqKioqKi8gXSk7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5vdHkuanMubWFwIiwiaW1wb3J0IGFwaSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgICAgICAgaW1wb3J0IGNvbnRlbnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Nhc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc2Nzcy5zY3NzXCI7XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY29udGVudC5sb2NhbHMgfHwge307IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpc09sZElFID0gZnVuY3Rpb24gaXNPbGRJRSgpIHtcbiAgdmFyIG1lbW87XG4gIHJldHVybiBmdW5jdGlvbiBtZW1vcml6ZSgpIHtcbiAgICBpZiAodHlwZW9mIG1lbW8gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuICAgICAgLy8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuICAgICAgLy8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlclxuICAgICAgLy8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcbiAgICAgIG1lbW8gPSBCb29sZWFuKHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcbn0oKTtcblxudmFyIGdldFRhcmdldCA9IGZ1bmN0aW9uIGdldFRhcmdldCgpIHtcbiAgdmFyIG1lbW8gPSB7fTtcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKHRhcmdldCkge1xuICAgIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVtb1t0YXJnZXRdO1xuICB9O1xufSgpO1xuXG52YXIgc3R5bGVzSW5Eb20gPSBbXTtcblxuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRvbS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRvbVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdXG4gICAgfTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZXNJbkRvbS5wdXNoKHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogYWRkU3R5bGUob2JqLCBvcHRpb25zKSxcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBvcHRpb25zLmF0dHJpYnV0ZXMgfHwge307XG5cbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzLm5vbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gJ3VuZGVmaW5lZCcgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgICBpZiAobm9uY2UpIHtcbiAgICAgIGF0dHJpYnV0ZXMubm9uY2UgPSBub25jZTtcbiAgICB9XG4gIH1cblxuICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgb3B0aW9ucy5pbnNlcnQoc3R5bGUpO1xuICB9IGVsc2Uge1xuICAgIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQob3B0aW9ucy5pbnNlcnQgfHwgJ2hlYWQnKTtcblxuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICAgIH1cblxuICAgIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gIH1cblxuICByZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlKTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbnZhciByZXBsYWNlVGV4dCA9IGZ1bmN0aW9uIHJlcGxhY2VUZXh0KCkge1xuICB2YXIgdGV4dFN0b3JlID0gW107XG4gIHJldHVybiBmdW5jdGlvbiByZXBsYWNlKGluZGV4LCByZXBsYWNlbWVudCkge1xuICAgIHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcbiAgICByZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyhzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG4gIHZhciBjc3MgPSByZW1vdmUgPyAnJyA6IG9iai5tZWRpYSA/IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIikuY29uY2F0KG9iai5jc3MsIFwifVwiKSA6IG9iai5jc3M7IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBzdHlsZS5jaGlsZE5vZGVzO1xuXG4gICAgaWYgKGNoaWxkTm9kZXNbaW5kZXhdKSB7XG4gICAgICBzdHlsZS5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBzdHlsZS5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChjc3NOb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyhzdHlsZSwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBvYmouY3NzO1xuICB2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG4gIGlmIChtZWRpYSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBtZWRpYSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUucmVtb3ZlQXR0cmlidXRlKCdtZWRpYScpO1xuICB9XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKHN0eWxlLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyIHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBhZGRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlO1xuICB2YXIgdXBkYXRlO1xuICB2YXIgcmVtb3ZlO1xuXG4gIGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuICAgIHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuICAgIHN0eWxlID0gc2luZ2xldG9uIHx8IChzaW5nbGV0b24gPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuICAgIHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuICAgIHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUgPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlLCBvcHRpb25zKTtcblxuICAgIHJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZShvYmopO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmUoKTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307IC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuICAvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cbiAgaWYgKCFvcHRpb25zLnNpbmdsZXRvbiAmJiB0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gIT09ICdib29sZWFuJykge1xuICAgIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuICB9XG5cbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuZXdMaXN0KSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRvbVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5Eb21bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5Eb20uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgTm90eSBmcm9tICdub3R5JztcclxuaW1wb3J0ICcuLy4uL3Njc3Mvc2Nzcy5zY3NzJztcclxuXHJcbmxldCBhZGRUb0NhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWRkLXRvLWNhcnQnKTtcclxubGV0IHRvdGFsQ291bnRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b3RhbC1jb3VudGVyJyk7XHJcbmxldCBsb2dpbkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2dpbi1idXR0b24nKTtcclxubGV0IHJlZ2lzdGVyRmxhc2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVnaXN0ZXItZmxhc2gnKTtcclxubGV0IG9yZGVyQWRkcmVzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5vcmRlci1hZGRyZXNzJyk7XHJcbmxldCBvcmRlckJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5vcmRlci1idG4nKTtcclxuXHJcbi8vd2hhdCBoYXBwZW5zIHdoZW4geW91IGNsaWNrIG9uIHRoZSBhZGQgYnV0dG9uXHJcblxyXG5sZXQgcHJlc3NlZEJ0bjtcclxuXHJcbmFkZFRvQ2FydC5mb3JFYWNoKGJ0biA9PiB7XHJcbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyAsICgpID0+IHtcclxuICAgIGJ0bi5zdHlsZS50cmFuc2l0aW9uID0gXCJ0cmFuc2Zvcm0gMnMgZWFzZVwiO1xyXG4gICAgYnRuLnN0eWxlLmJhY2tncm91bmQgPSBcInllbGxvd1wiO1xyXG4gICAgcHJlc3NlZEJ0biA9IGJ0bjtcclxuICAgIGxldCBwaXp6YSA9IEpTT04ucGFyc2UoYnRuLmRhdGFzZXQucGl6emEpO1xyXG4gICAgdXBkYXRlQ2FydChwaXp6YSk7XHJcbiAgfSlcclxufSk7XHJcblxyXG5cclxuLy9mdW5jdGlvbiB0byBzZW5kIHBvc3QgcmVxdWVzdCB3aXRoIHRoZSBwaXp6YSBpbmZvXHJcbmZ1bmN0aW9uIHVwZGF0ZUNhcnQocGl6emEpIHtcclxuICBheGlvcy5wb3N0KCcvdXBkYXRlLWNhcnQnLCBwaXp6YSkudGhlbihyZXMgPT57XHJcbiAgICBwcmVzc2VkQnRuLnN0eWxlLmJhY2tncm91bmQgPSBcIiNGRTVGMUVcIjtcclxuICAgIHRvdGFsQ291bnRlci5pbm5lclRleHQgPSByZXMuZGF0YS50b3RhbFF0eTtcclxuICAgIG5ldyBOb3R5KHtcclxuICAgICAgdGhlbWVzIDogXCJzdW5zZXRcIixcclxuICAgICAgbGF5b3V0IDogXCJib3R0b21SaWdodFwiLFxyXG4gICAgICB0eXBlIDogJ3N1Y2Nlc3MnLFxyXG4gICAgICB0aW1lb3V0IDogMjAwMCxcclxuICAgICAgdGV4dDogJ0l0ZW0gYWRkZWQgdG8gdGhlIGNhcnQnLFxyXG4gICAgfSkuc2hvdygpO1xyXG4gIH0pLmNhdGNoKGVyciA9PiB7XHJcbiAgICBuZXcgTm90eSh7XHJcbiAgICAgIHRoZW1lcyA6IFwic3Vuc2V0XCIsXHJcbiAgICAgIGxheW91dCA6IFwiYm90dG9tUmlnaHRcIixcclxuICAgICAgdHlwZSA6ICdlcnJvcicsXHJcbiAgICAgIHRpbWVvdXQgOiAyMDAwLFxyXG4gICAgICB0ZXh0OiBgRXJyb3IgOiBDb3VsZG4ndCBhZGQgdG8gY2FydGAsXHJcbiAgICB9KS5zaG93KCk7XHJcbiAgfSk7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiBtb2R1bGVbJ2RlZmF1bHQnXSA6XG5cdFx0KCkgPT4gbW9kdWxlO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZVxuX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vcmVzb3VyY2VzL2pzL2pzLmpzXCIpO1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnZXhwb3J0cycgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxuIl0sInNvdXJjZVJvb3QiOiIifQ==