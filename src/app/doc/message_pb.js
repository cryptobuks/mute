/**
 * @fileoverview
 * @enhanceable
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.Doc', null, global);
goog.exportSymbol('proto.Identifier', null, global);
goog.exportSymbol('proto.LogootSAdd', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Doc = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.Doc.oneofGroups_);
};
goog.inherits(proto.Doc, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.Doc.displayName = 'proto.Doc';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.Doc.oneofGroups_ = [[1]];

/**
 * @enum {number}
 */
proto.Doc.TypeCase = {
  TYPE_NOT_SET: 0,
  LOGOOTSADD: 1
};

/**
 * @return {proto.Doc.TypeCase}
 */
proto.Doc.prototype.getTypeCase = function() {
  return /** @type {proto.Doc.TypeCase} */(jspb.Message.computeOneofCase(this, proto.Doc.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Doc.prototype.toObject = function(opt_includeInstance) {
  return proto.Doc.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Doc} msg The msg instance to transform.
 * @return {!Object}
 */
proto.Doc.toObject = function(includeInstance, msg) {
  var f, obj = {
    logootsadd: (f = msg.getLogootsadd()) && proto.LogootSAdd.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Doc}
 */
proto.Doc.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Doc;
  return proto.Doc.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Doc} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Doc}
 */
proto.Doc.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.LogootSAdd;
      reader.readMessage(value,proto.LogootSAdd.deserializeBinaryFromReader);
      msg.setLogootsadd(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Class method variant: serializes the given message to binary data
 * (in protobuf wire format), writing to the given BinaryWriter.
 * @param {!proto.Doc} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.Doc.serializeBinaryToWriter = function(message, writer) {
  message.serializeBinaryToWriter(writer);
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Doc.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  this.serializeBinaryToWriter(writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the message to binary data (in protobuf wire format),
 * writing to the given BinaryWriter.
 * @param {!jspb.BinaryWriter} writer
 */
proto.Doc.prototype.serializeBinaryToWriter = function (writer) {
  var f = undefined;
  f = this.getLogootsadd();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.LogootSAdd.serializeBinaryToWriter
    );
  }
};


/**
 * optional LogootSAdd logootSAdd = 1;
 * @return {?proto.LogootSAdd}
 */
proto.Doc.prototype.getLogootsadd = function() {
  return /** @type{?proto.LogootSAdd} */ (
    jspb.Message.getWrapperField(this, proto.LogootSAdd, 1));
};


/** @param {?proto.LogootSAdd|undefined} value */
proto.Doc.prototype.setLogootsadd = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.Doc.oneofGroups_[0], value);
};


proto.Doc.prototype.clearLogootsadd = function() {
  this.setLogootsadd(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.Doc.prototype.hasLogootsadd = function() {
  return jspb.Message.getField(this, 1) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Identifier = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.Identifier.repeatedFields_, null);
};
goog.inherits(proto.Identifier, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.Identifier.displayName = 'proto.Identifier';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.Identifier.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Identifier.prototype.toObject = function(opt_includeInstance) {
  return proto.Identifier.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Identifier} msg The msg instance to transform.
 * @return {!Object}
 */
proto.Identifier.toObject = function(includeInstance, msg) {
  var f, obj = {
    baseList: jspb.Message.getField(msg, 1),
    last: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Identifier}
 */
proto.Identifier.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Identifier;
  return proto.Identifier.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Identifier} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Identifier}
 */
proto.Identifier.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Array.<number>} */ (reader.readPackedInt32());
      msg.setBaseList(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLast(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Class method variant: serializes the given message to binary data
 * (in protobuf wire format), writing to the given BinaryWriter.
 * @param {!proto.Identifier} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.Identifier.serializeBinaryToWriter = function(message, writer) {
  message.serializeBinaryToWriter(writer);
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Identifier.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  this.serializeBinaryToWriter(writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the message to binary data (in protobuf wire format),
 * writing to the given BinaryWriter.
 * @param {!jspb.BinaryWriter} writer
 */
proto.Identifier.prototype.serializeBinaryToWriter = function (writer) {
  var f = undefined;
  f = this.getBaseList();
  if (f.length > 0) {
    writer.writePackedInt32(
      1,
      f
    );
  }
  f = this.getLast();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
};


/**
 * repeated int32 base = 1;
 * If you change this array by adding, removing or replacing elements, or if you
 * replace the array itself, then you must call the setter to update it.
 * @return {!Array.<number>}
 */
proto.Identifier.prototype.getBaseList = function() {
  return /** @type {!Array.<number>} */ (jspb.Message.getField(this, 1));
};


/** @param {!Array.<number>} value */
proto.Identifier.prototype.setBaseList = function(value) {
  jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {!number} value
 * @param {number=} opt_index
 */
proto.Identifier.prototype.addBase = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


proto.Identifier.prototype.clearBaseList = function() {
  this.setBaseList([]);
};


/**
 * optional int32 last = 2;
 * @return {number}
 */
proto.Identifier.prototype.getLast = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.Identifier.prototype.setLast = function(value) {
  jspb.Message.setField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.LogootSAdd = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.LogootSAdd, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.LogootSAdd.displayName = 'proto.LogootSAdd';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.LogootSAdd.prototype.toObject = function(opt_includeInstance) {
  return proto.LogootSAdd.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.LogootSAdd} msg The msg instance to transform.
 * @return {!Object}
 */
proto.LogootSAdd.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: (f = msg.getId()) && proto.Identifier.toObject(includeInstance, f),
    content: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.LogootSAdd}
 */
proto.LogootSAdd.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.LogootSAdd;
  return proto.LogootSAdd.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.LogootSAdd} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.LogootSAdd}
 */
proto.LogootSAdd.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.Identifier;
      reader.readMessage(value,proto.Identifier.deserializeBinaryFromReader);
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setContent(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Class method variant: serializes the given message to binary data
 * (in protobuf wire format), writing to the given BinaryWriter.
 * @param {!proto.LogootSAdd} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.LogootSAdd.serializeBinaryToWriter = function(message, writer) {
  message.serializeBinaryToWriter(writer);
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.LogootSAdd.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  this.serializeBinaryToWriter(writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the message to binary data (in protobuf wire format),
 * writing to the given BinaryWriter.
 * @param {!jspb.BinaryWriter} writer
 */
proto.LogootSAdd.prototype.serializeBinaryToWriter = function (writer) {
  var f = undefined;
  f = this.getId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.Identifier.serializeBinaryToWriter
    );
  }
  f = this.getContent();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional Identifier id = 1;
 * @return {?proto.Identifier}
 */
proto.LogootSAdd.prototype.getId = function() {
  return /** @type{?proto.Identifier} */ (
    jspb.Message.getWrapperField(this, proto.Identifier, 1));
};


/** @param {?proto.Identifier|undefined} value */
proto.LogootSAdd.prototype.setId = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.LogootSAdd.prototype.clearId = function() {
  this.setId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.LogootSAdd.prototype.hasId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string content = 2;
 * @return {string}
 */
proto.LogootSAdd.prototype.getContent = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.LogootSAdd.prototype.setContent = function(value) {
  jspb.Message.setField(this, 2, value);
};


goog.object.extend(exports, proto);