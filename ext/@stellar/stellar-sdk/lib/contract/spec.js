"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spec = void 0;
var _stellarBase = require("@stellar/stellar-base");
var _rust_result = require("./rust_result");
function enumToJsonSchema(udt) {
  const description = udt.doc().toString();
  const cases = udt.cases();
  const oneOf = [];
  cases.forEach(aCase => {
    const title = aCase.name().toString();
    const desc = aCase.doc().toString();
    oneOf.push({
      description: desc,
      title,
      enum: [aCase.value()],
      type: "number"
    });
  });
  const res = {
    oneOf
  };
  if (description.length > 0) {
    res.description = description;
  }
  return res;
}
function isNumeric(field) {
  return /^\d+$/.test(field.name().toString());
}
function readObj(args, input) {
  const inputName = input.name().toString();
  const entry = Object.entries(args).find(([name]) => name === inputName);
  if (!entry) {
    throw new Error(`Missing field ${inputName}`);
  }
  return entry[1];
}
function findCase(name) {
  return function matches(entry) {
    switch (entry.switch().value) {
      case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0().value:
        {
          const tuple = entry.tupleCase();
          return tuple.name().toString() === name;
        }
      case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0().value:
        {
          const voidCase = entry.voidCase();
          return voidCase.name().toString() === name;
        }
      default:
        return false;
    }
  };
}
function stringToScVal(str, ty) {
  switch (ty.value) {
    case _stellarBase.xdr.ScSpecType.scSpecTypeString().value:
      return _stellarBase.xdr.ScVal.scvString(str);
    case _stellarBase.xdr.ScSpecType.scSpecTypeSymbol().value:
      return _stellarBase.xdr.ScVal.scvSymbol(str);
    case _stellarBase.xdr.ScSpecType.scSpecTypeAddress().value:
      {
        const addr = _stellarBase.Address.fromString(str);
        return _stellarBase.xdr.ScVal.scvAddress(addr.toScAddress());
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeU64().value:
      return new _stellarBase.XdrLargeInt("u64", str).toScVal();
    case _stellarBase.xdr.ScSpecType.scSpecTypeI64().value:
      return new _stellarBase.XdrLargeInt("i64", str).toScVal();
    case _stellarBase.xdr.ScSpecType.scSpecTypeU128().value:
      return new _stellarBase.XdrLargeInt("u128", str).toScVal();
    case _stellarBase.xdr.ScSpecType.scSpecTypeI128().value:
      return new _stellarBase.XdrLargeInt("i128", str).toScVal();
    case _stellarBase.xdr.ScSpecType.scSpecTypeU256().value:
      return new _stellarBase.XdrLargeInt("u256", str).toScVal();
    case _stellarBase.xdr.ScSpecType.scSpecTypeI256().value:
      return new _stellarBase.XdrLargeInt("i256", str).toScVal();
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytes().value:
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytesN().value:
      return _stellarBase.xdr.ScVal.scvBytes(Buffer.from(str, "base64"));
    default:
      throw new TypeError(`invalid type ${ty.name} specified for string value`);
  }
}
const PRIMITIVE_DEFINITONS = {
  U32: {
    type: "integer",
    minimum: 0,
    maximum: 4294967295
  },
  I32: {
    type: "integer",
    minimum: -2147483648,
    maximum: 2147483647
  },
  U64: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 20 // 64-bit max value has 20 digits
  },
  I64: {
    type: "string",
    pattern: "^(-?[1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 21 // Includes additional digit for the potential '-'
  },
  U128: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 39 // 128-bit max value has 39 digits
  },
  I128: {
    type: "string",
    pattern: "^(-?[1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 40 // Includes additional digit for the potential '-'
  },
  U256: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 78 // 256-bit max value has 78 digits
  },
  I256: {
    type: "string",
    pattern: "^(-?[1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 79 // Includes additional digit for the potential '-'
  },
  Address: {
    type: "string",
    format: "address",
    description: "Address can be a public key or contract id"
  },
  ScString: {
    type: "string",
    description: "ScString is a string"
  },
  ScSymbol: {
    type: "string",
    description: "ScString is a string"
  },
  DataUrl: {
    type: "string",
    pattern: "^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)?$"
  }
};

/* eslint-disable default-case */
/**
 * @param typeDef type to convert to json schema reference
 * @returns {JSONSchema7} a schema describing the type
 * @private
 */
function typeRef(typeDef) {
  const t = typeDef.switch();
  const value = t.value;
  let ref;
  switch (value) {
    case _stellarBase.xdr.ScSpecType.scSpecTypeVal().value:
      {
        ref = "Val";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeBool().value:
      {
        return {
          type: "boolean"
        };
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeVoid().value:
      {
        return {
          type: "null"
        };
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeError().value:
      {
        ref = "Error";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeU32().value:
      {
        ref = "U32";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeI32().value:
      {
        ref = "I32";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeU64().value:
      {
        ref = "U64";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeI64().value:
      {
        ref = "I64";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeTimepoint().value:
      {
        throw new Error("Timepoint type not supported");
        ref = "Timepoint";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeDuration().value:
      {
        throw new Error("Duration not supported");
        ref = "Duration";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeU128().value:
      {
        ref = "U128";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeI128().value:
      {
        ref = "I128";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeU256().value:
      {
        ref = "U256";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeI256().value:
      {
        ref = "I256";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytes().value:
      {
        ref = "DataUrl";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeString().value:
      {
        ref = "ScString";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeSymbol().value:
      {
        ref = "ScSymbol";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeAddress().value:
      {
        ref = "Address";
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeOption().value:
      {
        const opt = typeDef.option();
        return typeRef(opt.valueType());
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeResult().value:
      {
        // throw new Error('Result type not supported');
        break;
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeVec().value:
      {
        const arr = typeDef.vec();
        const reference = typeRef(arr.elementType());
        return {
          type: "array",
          items: reference
        };
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeMap().value:
      {
        const map = typeDef.map();
        const items = [typeRef(map.keyType()), typeRef(map.valueType())];
        return {
          type: "array",
          items: {
            type: "array",
            items,
            minItems: 2,
            maxItems: 2
          }
        };
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeTuple().value:
      {
        const tuple = typeDef.tuple();
        const minItems = tuple.valueTypes().length;
        const maxItems = minItems;
        const items = tuple.valueTypes().map(typeRef);
        return {
          type: "array",
          items,
          minItems,
          maxItems
        };
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytesN().value:
      {
        const arr = typeDef.bytesN();
        return {
          $ref: "#/definitions/DataUrl",
          maxLength: arr.n()
        };
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeUdt().value:
      {
        const udt = typeDef.udt();
        ref = udt.name().toString();
        break;
      }
  }
  return {
    $ref: `#/definitions/${ref}`
  };
}
/* eslint-enable default-case */

function isRequired(typeDef) {
  return typeDef.switch().value !== _stellarBase.xdr.ScSpecType.scSpecTypeOption().value;
}
function argsAndRequired(input) {
  const properties = {};
  const required = [];
  input.forEach(arg => {
    const aType = arg.type();
    const name = arg.name().toString();
    properties[name] = typeRef(aType);
    if (isRequired(aType)) {
      required.push(name);
    }
  });
  const res = {
    properties
  };
  if (required.length > 0) {
    res.required = required;
  }
  return res;
}
function structToJsonSchema(udt) {
  const fields = udt.fields();
  if (fields.some(isNumeric)) {
    if (!fields.every(isNumeric)) {
      throw new Error("mixed numeric and non-numeric field names are not allowed");
    }
    const items = fields.map((_, i) => typeRef(fields[i].type()));
    return {
      type: "array",
      items,
      minItems: fields.length,
      maxItems: fields.length
    };
  }
  const description = udt.doc().toString();
  const {
    properties,
    required
  } = argsAndRequired(fields);
  properties.additionalProperties = false;
  return {
    description,
    properties,
    required,
    type: "object"
  };
}
function functionToJsonSchema(func) {
  const {
    properties,
    required
  } = argsAndRequired(func.inputs());
  const args = {
    additionalProperties: false,
    properties,
    type: "object"
  };
  if (required?.length > 0) {
    args.required = required;
  }
  const input = {
    properties: {
      args
    }
  };
  const outputs = func.outputs();
  const output = outputs.length > 0 ? typeRef(outputs[0]) : typeRef(_stellarBase.xdr.ScSpecTypeDef.scSpecTypeVoid());
  const description = func.doc().toString();
  if (description.length > 0) {
    input.description = description;
  }
  input.additionalProperties = false;
  output.additionalProperties = false;
  return {
    input,
    output
  };
}

/* eslint-disable default-case */
function unionToJsonSchema(udt) {
  const description = udt.doc().toString();
  const cases = udt.cases();
  const oneOf = [];
  cases.forEach(aCase => {
    switch (aCase.switch().value) {
      case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0().value:
        {
          const c = aCase.voidCase();
          const title = c.name().toString();
          oneOf.push({
            type: "object",
            title,
            properties: {
              tag: title
            },
            additionalProperties: false,
            required: ["tag"]
          });
          break;
        }
      case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0().value:
        {
          const c = aCase.tupleCase();
          const title = c.name().toString();
          oneOf.push({
            type: "object",
            title,
            properties: {
              tag: title,
              values: {
                type: "array",
                items: c.type().map(typeRef)
              }
            },
            required: ["tag", "values"],
            additionalProperties: false
          });
        }
    }
  });
  const res = {
    oneOf
  };
  if (description.length > 0) {
    res.description = description;
  }
  return res;
}
/* eslint-enable default-case */

/**
 * Provides a ContractSpec class which can contains the XDR types defined by the contract.
 * This allows the class to be used to convert between native and raw `xdr.ScVal`s.
 *
 * Constructs a new ContractSpec from an array of XDR spec entries.
 *
 * @memberof module:contract
 * @param {xdr.ScSpecEntry[] | string[]} entries the XDR spec entries
 * @throws {Error} if entries is invalid
 *
 * @example
 * const specEntries = [...]; // XDR spec entries of a smart contract
 * const contractSpec = new ContractSpec(specEntries);
 *
 * // Convert native value to ScVal
 * const args = {
 *   arg1: 'value1',
 *   arg2: 1234
 * };
 * const scArgs = contractSpec.funcArgsToScVals('funcName', args);
 *
 * // Call contract
 * const resultScv = await callContract(contractId, 'funcName', scArgs);
 *
 * // Convert result ScVal back to native value
 * const result = contractSpec.funcResToNative('funcName', resultScv);
 *
 * console.log(result); // {success: true}
 */
class Spec {
  /**
   * The XDR spec entries.
   */
  entries = [];
  constructor(entries) {
    if (entries.length === 0) {
      throw new Error("Contract spec must have at least one entry");
    }
    const entry = entries[0];
    if (typeof entry === "string") {
      this.entries = entries.map(s => _stellarBase.xdr.ScSpecEntry.fromXDR(s, "base64"));
    } else {
      this.entries = entries;
    }
  }

  /**
   * Gets the XDR functions from the spec.
   * @returns {xdr.ScSpecFunctionV0[]} all contract functions
   */
  funcs() {
    return this.entries.filter(entry => entry.switch().value === _stellarBase.xdr.ScSpecEntryKind.scSpecEntryFunctionV0().value).map(entry => entry.functionV0());
  }

  /**
   * Gets the XDR function spec for the given function name.
   *
   * @param {string} name the name of the function
   * @returns {xdr.ScSpecFunctionV0} the function spec
   *
   * @throws {Error} if no function with the given name exists
   */
  getFunc(name) {
    const entry = this.findEntry(name);
    if (entry.switch().value !== _stellarBase.xdr.ScSpecEntryKind.scSpecEntryFunctionV0().value) {
      throw new Error(`${name} is not a function`);
    }
    return entry.functionV0();
  }

  /**
   * Converts native JS arguments to ScVals for calling a contract function.
   *
   * @param {string} name the name of the function
   * @param {object} args the arguments object
   * @returns {xdr.ScVal[]} the converted arguments
   *
   * @throws {Error} if argument is missing or incorrect type
   *
   * @example
   * const args = {
   *   arg1: 'value1',
   *   arg2: 1234
   * };
   * const scArgs = contractSpec.funcArgsToScVals('funcName', args);
   */
  funcArgsToScVals(name, args) {
    const fn = this.getFunc(name);
    return fn.inputs().map(input => this.nativeToScVal(readObj(args, input), input.type()));
  }

  /**
   * Converts the result ScVal of a function call to a native JS value.
   *
   * @param {string} name the name of the function
   * @param {xdr.ScVal | string} val_or_base64 the result ScVal or base64 encoded string
   * @returns {any} the converted native value
   *
   * @throws {Error} if return type mismatch or invalid input
   *
   * @example
   * const resultScv = 'AAA=='; // Base64 encoded ScVal
   * const result = contractSpec.funcResToNative('funcName', resultScv);
   */
  funcResToNative(name, val_or_base64) {
    const val = typeof val_or_base64 === "string" ? _stellarBase.xdr.ScVal.fromXDR(val_or_base64, "base64") : val_or_base64;
    const func = this.getFunc(name);
    const outputs = func.outputs();
    if (outputs.length === 0) {
      const type = val.switch();
      if (type.value !== _stellarBase.xdr.ScValType.scvVoid().value) {
        throw new Error(`Expected void, got ${type.name}`);
      }
      return null;
    }
    if (outputs.length > 1) {
      throw new Error(`Multiple outputs not supported`);
    }
    const output = outputs[0];
    if (output.switch().value === _stellarBase.xdr.ScSpecType.scSpecTypeResult().value) {
      return new _rust_result.Ok(this.scValToNative(val, output.result().okType()));
    }
    return this.scValToNative(val, output);
  }

  /**
   * Finds the XDR spec entry for the given name.
   *
   * @param {string} name the name to find
   * @returns {xdr.ScSpecEntry} the entry
   *
   * @throws {Error} if no entry with the given name exists
   */
  findEntry(name) {
    const entry = this.entries.find(e => e.value().name().toString() === name);
    if (!entry) {
      throw new Error(`no such entry: ${name}`);
    }
    return entry;
  }

  /**
   * Converts a native JS value to an ScVal based on the given type.
   *
   * @param {any} val the native JS value
   * @param {xdr.ScSpecTypeDef} [ty] the expected type
   * @returns {xdr.ScVal} the converted ScVal
   *
   * @throws {Error} if value cannot be converted to the given type
   */
  nativeToScVal(val, ty) {
    const t = ty.switch();
    const value = t.value;
    if (t.value === _stellarBase.xdr.ScSpecType.scSpecTypeUdt().value) {
      const udt = ty.udt();
      return this.nativeToUdt(val, udt.name().toString());
    }
    if (value === _stellarBase.xdr.ScSpecType.scSpecTypeOption().value) {
      const opt = ty.option();
      if (val === undefined) {
        return _stellarBase.xdr.ScVal.scvVoid();
      }
      return this.nativeToScVal(val, opt.valueType());
    }
    switch (typeof val) {
      case "object":
        {
          if (val === null) {
            switch (value) {
              case _stellarBase.xdr.ScSpecType.scSpecTypeVoid().value:
                return _stellarBase.xdr.ScVal.scvVoid();
              default:
                throw new TypeError(`Type ${ty} was not void, but value was null`);
            }
          }
          if (val instanceof _stellarBase.xdr.ScVal) {
            return val; // should we copy?
          }
          if (val instanceof _stellarBase.Address) {
            if (ty.switch().value !== _stellarBase.xdr.ScSpecType.scSpecTypeAddress().value) {
              throw new TypeError(`Type ${ty} was not address, but value was Address`);
            }
            return val.toScVal();
          }
          if (val instanceof _stellarBase.Contract) {
            if (ty.switch().value !== _stellarBase.xdr.ScSpecType.scSpecTypeAddress().value) {
              throw new TypeError(`Type ${ty} was not address, but value was Address`);
            }
            return val.address().toScVal();
          }
          if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
            const copy = Uint8Array.from(val);
            switch (value) {
              case _stellarBase.xdr.ScSpecType.scSpecTypeBytesN().value:
                {
                  const bytesN = ty.bytesN();
                  if (copy.length !== bytesN.n()) {
                    throw new TypeError(`expected ${bytesN.n()} bytes, but got ${copy.length}`);
                  }
                  //@ts-ignore
                  return _stellarBase.xdr.ScVal.scvBytes(copy);
                }
              case _stellarBase.xdr.ScSpecType.scSpecTypeBytes().value:
                //@ts-ignore
                return _stellarBase.xdr.ScVal.scvBytes(copy);
              default:
                throw new TypeError(`invalid type (${ty}) specified for Bytes and BytesN`);
            }
          }
          if (Array.isArray(val)) {
            switch (value) {
              case _stellarBase.xdr.ScSpecType.scSpecTypeVec().value:
                {
                  const vec = ty.vec();
                  const elementType = vec.elementType();
                  return _stellarBase.xdr.ScVal.scvVec(val.map(v => this.nativeToScVal(v, elementType)));
                }
              case _stellarBase.xdr.ScSpecType.scSpecTypeTuple().value:
                {
                  const tup = ty.tuple();
                  const valTypes = tup.valueTypes();
                  if (val.length !== valTypes.length) {
                    throw new TypeError(`Tuple expects ${valTypes.length} values, but ${val.length} were provided`);
                  }
                  return _stellarBase.xdr.ScVal.scvVec(val.map((v, i) => this.nativeToScVal(v, valTypes[i])));
                }
              case _stellarBase.xdr.ScSpecType.scSpecTypeMap().value:
                {
                  const map = ty.map();
                  const keyType = map.keyType();
                  const valueType = map.valueType();
                  return _stellarBase.xdr.ScVal.scvMap(val.map(entry => {
                    const key = this.nativeToScVal(entry[0], keyType);
                    const mapVal = this.nativeToScVal(entry[1], valueType);
                    return new _stellarBase.xdr.ScMapEntry({
                      key,
                      val: mapVal
                    });
                  }));
                }
              default:
                throw new TypeError(`Type ${ty} was not vec, but value was Array`);
            }
          }
          if (val.constructor === Map) {
            if (value !== _stellarBase.xdr.ScSpecType.scSpecTypeMap().value) {
              throw new TypeError(`Type ${ty} was not map, but value was Map`);
            }
            const scMap = ty.map();
            const map = val;
            const entries = [];
            const values = map.entries();
            let res = values.next();
            while (!res.done) {
              const [k, v] = res.value;
              const key = this.nativeToScVal(k, scMap.keyType());
              const mapval = this.nativeToScVal(v, scMap.valueType());
              entries.push(new _stellarBase.xdr.ScMapEntry({
                key,
                val: mapval
              }));
              res = values.next();
            }
            return _stellarBase.xdr.ScVal.scvMap(entries);
          }
          if ((val.constructor?.name ?? "") !== "Object") {
            throw new TypeError(`cannot interpret ${val.constructor?.name} value as ScVal (${JSON.stringify(val)})`);
          }
          throw new TypeError(`Received object ${val}  did not match the provided type ${ty}`);
        }
      case "number":
      case "bigint":
        {
          switch (value) {
            case _stellarBase.xdr.ScSpecType.scSpecTypeU32().value:
              return _stellarBase.xdr.ScVal.scvU32(val);
            case _stellarBase.xdr.ScSpecType.scSpecTypeI32().value:
              return _stellarBase.xdr.ScVal.scvI32(val);
            case _stellarBase.xdr.ScSpecType.scSpecTypeU64().value:
            case _stellarBase.xdr.ScSpecType.scSpecTypeI64().value:
            case _stellarBase.xdr.ScSpecType.scSpecTypeU128().value:
            case _stellarBase.xdr.ScSpecType.scSpecTypeI128().value:
            case _stellarBase.xdr.ScSpecType.scSpecTypeU256().value:
            case _stellarBase.xdr.ScSpecType.scSpecTypeI256().value:
              {
                const intType = t.name.substring(10).toLowerCase();
                return new _stellarBase.XdrLargeInt(intType, val).toScVal();
              }
            default:
              throw new TypeError(`invalid type (${ty}) specified for integer`);
          }
        }
      case "string":
        return stringToScVal(val, t);
      case "boolean":
        {
          if (value !== _stellarBase.xdr.ScSpecType.scSpecTypeBool().value) {
            throw TypeError(`Type ${ty} was not bool, but value was bool`);
          }
          return _stellarBase.xdr.ScVal.scvBool(val);
        }
      case "undefined":
        {
          if (!ty) {
            return _stellarBase.xdr.ScVal.scvVoid();
          }
          switch (value) {
            case _stellarBase.xdr.ScSpecType.scSpecTypeVoid().value:
            case _stellarBase.xdr.ScSpecType.scSpecTypeOption().value:
              return _stellarBase.xdr.ScVal.scvVoid();
            default:
              throw new TypeError(`Type ${ty} was not void, but value was undefined`);
          }
        }
      case "function":
        // FIXME: Is this too helpful?
        return this.nativeToScVal(val(), ty);
      default:
        throw new TypeError(`failed to convert typeof ${typeof val} (${val})`);
    }
  }
  nativeToUdt(val, name) {
    const entry = this.findEntry(name);
    switch (entry.switch()) {
      case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        if (typeof val !== "number") {
          throw new TypeError(`expected number for enum ${name}, but got ${typeof val}`);
        }
        return this.nativeToEnum(val, entry.udtEnumV0());
      case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        return this.nativeToStruct(val, entry.udtStructV0());
      case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.nativeToUnion(val, entry.udtUnionV0());
      default:
        throw new Error(`failed to parse udt ${name}`);
    }
  }
  nativeToUnion(val, union_) {
    const entryName = val.tag;
    const caseFound = union_.cases().find(entry => {
      const caseN = entry.value().name().toString();
      return caseN === entryName;
    });
    if (!caseFound) {
      throw new TypeError(`no such enum entry: ${entryName} in ${union_}`);
    }
    const key = _stellarBase.xdr.ScVal.scvSymbol(entryName);
    switch (caseFound.switch()) {
      case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0():
        {
          return _stellarBase.xdr.ScVal.scvVec([key]);
        }
      case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0():
        {
          const types = caseFound.tupleCase().type();
          if (Array.isArray(val.values)) {
            if (val.values.length !== types.length) {
              throw new TypeError(`union ${union_} expects ${types.length} values, but got ${val.values.length}`);
            }
            const scvals = val.values.map((v, i) => this.nativeToScVal(v, types[i]));
            scvals.unshift(key);
            return _stellarBase.xdr.ScVal.scvVec(scvals);
          }
          throw new Error(`failed to parse union case ${caseFound} with ${val}`);
        }
      default:
        throw new Error(`failed to parse union ${union_} with ${val}`);
    }
  }
  nativeToStruct(val, struct) {
    const fields = struct.fields();
    if (fields.some(isNumeric)) {
      if (!fields.every(isNumeric)) {
        throw new Error("mixed numeric and non-numeric field names are not allowed");
      }
      return _stellarBase.xdr.ScVal.scvVec(fields.map((_, i) => this.nativeToScVal(val[i], fields[i].type())));
    }
    return _stellarBase.xdr.ScVal.scvMap(fields.map(field => {
      const name = field.name().toString();
      return new _stellarBase.xdr.ScMapEntry({
        key: this.nativeToScVal(name, _stellarBase.xdr.ScSpecTypeDef.scSpecTypeSymbol()),
        val: this.nativeToScVal(val[name], field.type())
      });
    }));
  }
  nativeToEnum(val, enum_) {
    if (enum_.cases().some(entry => entry.value() === val)) {
      return _stellarBase.xdr.ScVal.scvU32(val);
    }
    throw new TypeError(`no such enum entry: ${val} in ${enum_}`);
  }

  /**
   * Converts an base64 encoded ScVal back to a native JS value based on the given type.
   *
   * @param {string} scv the base64 encoded ScVal
   * @param {xdr.ScSpecTypeDef} typeDef the expected type
   * @returns {any} the converted native JS value
   *
   * @throws {Error} if ScVal cannot be converted to the given type
   */
  scValStrToNative(scv, typeDef) {
    return this.scValToNative(_stellarBase.xdr.ScVal.fromXDR(scv, "base64"), typeDef);
  }

  /**
   * Converts an ScVal back to a native JS value based on the given type.
   *
   * @param {xdr.ScVal} scv the ScVal
   * @param {xdr.ScSpecTypeDef} typeDef the expected type
   * @returns {any} the converted native JS value
   *
   * @throws {Error} if ScVal cannot be converted to the given type
   */
  scValToNative(scv, typeDef) {
    const t = typeDef.switch();
    const value = t.value;
    if (value === _stellarBase.xdr.ScSpecType.scSpecTypeUdt().value) {
      return this.scValUdtToNative(scv, typeDef.udt());
    }
    /* eslint-disable no-fallthrough*/
    // we use the verbose xdr.ScValType.<type>.value form here because it's faster
    // than string comparisons and the underlying constants never need to be
    // updated
    switch (scv.switch().value) {
      case _stellarBase.xdr.ScValType.scvVoid().value:
        return undefined;

      // these can be converted to bigints directly
      case _stellarBase.xdr.ScValType.scvU64().value:
      case _stellarBase.xdr.ScValType.scvI64().value:
      // these can be parsed by internal abstractions note that this can also
      // handle the above two cases, but it's not as efficient (another
      // type-check, parsing, etc.)
      case _stellarBase.xdr.ScValType.scvU128().value:
      case _stellarBase.xdr.ScValType.scvI128().value:
      case _stellarBase.xdr.ScValType.scvU256().value:
      case _stellarBase.xdr.ScValType.scvI256().value:
        return (0, _stellarBase.scValToBigInt)(scv);
      case _stellarBase.xdr.ScValType.scvVec().value:
        {
          if (value === _stellarBase.xdr.ScSpecType.scSpecTypeVec().value) {
            const vec = typeDef.vec();
            return (scv.vec() ?? []).map(elm => this.scValToNative(elm, vec.elementType()));
          }
          if (value === _stellarBase.xdr.ScSpecType.scSpecTypeTuple().value) {
            const tuple = typeDef.tuple();
            const valTypes = tuple.valueTypes();
            return (scv.vec() ?? []).map((elm, i) => this.scValToNative(elm, valTypes[i]));
          }
          throw new TypeError(`Type ${typeDef} was not vec, but ${scv} is`);
        }
      case _stellarBase.xdr.ScValType.scvAddress().value:
        return _stellarBase.Address.fromScVal(scv).toString();
      case _stellarBase.xdr.ScValType.scvMap().value:
        {
          const map = scv.map() ?? [];
          if (value === _stellarBase.xdr.ScSpecType.scSpecTypeMap().value) {
            const typed = typeDef.map();
            const keyType = typed.keyType();
            const valueType = typed.valueType();
            const res = map.map(entry => [this.scValToNative(entry.key(), keyType), this.scValToNative(entry.val(), valueType)]);
            return res;
          }
          throw new TypeError(`ScSpecType ${t.name} was not map, but ${JSON.stringify(scv, null, 2)} is`);
        }

      // these return the primitive type directly
      case _stellarBase.xdr.ScValType.scvBool().value:
      case _stellarBase.xdr.ScValType.scvU32().value:
      case _stellarBase.xdr.ScValType.scvI32().value:
      case _stellarBase.xdr.ScValType.scvBytes().value:
        return scv.value();
      case _stellarBase.xdr.ScValType.scvString().value:
      case _stellarBase.xdr.ScValType.scvSymbol().value:
        {
          if (value !== _stellarBase.xdr.ScSpecType.scSpecTypeString().value && value !== _stellarBase.xdr.ScSpecType.scSpecTypeSymbol().value) {
            throw new Error(`ScSpecType ${t.name} was not string or symbol, but ${JSON.stringify(scv, null, 2)} is`);
          }
          return scv.value()?.toString();
        }

      // these can be converted to bigint
      case _stellarBase.xdr.ScValType.scvTimepoint().value:
      case _stellarBase.xdr.ScValType.scvDuration().value:
        return (0, _stellarBase.scValToBigInt)(_stellarBase.xdr.ScVal.scvU64(scv.u64()));

      // in the fallthrough case, just return the underlying value directly
      default:
        throw new TypeError(`failed to convert ${JSON.stringify(scv, null, 2)} to native type from type ${t.name}`);
    }
    /* eslint-enable no-fallthrough*/
  }
  scValUdtToNative(scv, udt) {
    const entry = this.findEntry(udt.name().toString());
    switch (entry.switch()) {
      case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        return this.enumToNative(scv);
      case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        return this.structToNative(scv, entry.udtStructV0());
      case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.unionToNative(scv, entry.udtUnionV0());
      default:
        throw new Error(`failed to parse udt ${udt.name().toString()}: ${entry}`);
    }
  }
  unionToNative(val, udt) {
    const vec = val.vec();
    if (!vec) {
      throw new Error(`${JSON.stringify(val, null, 2)} is not a vec`);
    }
    if (vec.length === 0 && udt.cases.length !== 0) {
      throw new Error(`${val} has length 0, but the there are at least one case in the union`);
    }
    const name = vec[0].sym().toString();
    if (vec[0].switch().value !== _stellarBase.xdr.ScValType.scvSymbol().value) {
      throw new Error(`{vec[0]} is not a symbol`);
    }
    const entry = udt.cases().find(findCase(name));
    if (!entry) {
      throw new Error(`failed to find entry ${name} in union {udt.name().toString()}`);
    }
    const res = {
      tag: name
    };
    if (entry.switch().value === _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0().value) {
      const tuple = entry.tupleCase();
      const ty = tuple.type();
      const values = ty.map((e, i) => this.scValToNative(vec[i + 1], e));
      res.values = values;
    }
    return res;
  }
  structToNative(val, udt) {
    const res = {};
    const fields = udt.fields();
    if (fields.some(isNumeric)) {
      const r = val.vec()?.map((entry, i) => this.scValToNative(entry, fields[i].type()));
      return r;
    }
    val.map()?.forEach((entry, i) => {
      const field = fields[i];
      res[field.name().toString()] = this.scValToNative(entry.val(), field.type());
    });
    return res;
  }
  enumToNative(scv) {
    if (scv.switch().value !== _stellarBase.xdr.ScValType.scvU32().value) {
      throw new Error(`Enum must have a u32 value`);
    }
    const num = scv.u32();
    return num;
  }

  /**
   * Gets the XDR error cases from the spec.
   *
   * @returns {xdr.ScSpecFunctionV0[]} all contract functions
   *
   */
  errorCases() {
    return this.entries.filter(entry => entry.switch().value === _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0().value).flatMap(entry => entry.value().cases());
  }

  /**
   * Converts the contract spec to a JSON schema.
   *
   * If `funcName` is provided, the schema will be a reference to the function schema.
   *
   * @param {string} [funcName] the name of the function to convert
   * @returns {JSONSchema7} the converted JSON schema
   *
   * @throws {Error} if the contract spec is invalid
   */
  jsonSchema(funcName) {
    const definitions = {};
    /* eslint-disable default-case */
    this.entries.forEach(entry => {
      switch (entry.switch().value) {
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0().value:
          {
            const udt = entry.udtEnumV0();
            definitions[udt.name().toString()] = enumToJsonSchema(udt);
            break;
          }
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtStructV0().value:
          {
            const udt = entry.udtStructV0();
            definitions[udt.name().toString()] = structToJsonSchema(udt);
            break;
          }
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0().value:
          {
            const udt = entry.udtUnionV0();
            definitions[udt.name().toString()] = unionToJsonSchema(udt);
            break;
          }
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryFunctionV0().value:
          {
            const fn = entry.functionV0();
            const fnName = fn.name().toString();
            const {
              input
            } = functionToJsonSchema(fn);
            // @ts-ignore
            definitions[fnName] = input;
            break;
          }
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0().value:
          {
            // console.debug("Error enums not supported yet");
          }
      }
    });
    /* eslint-enable default-case */
    const res = {
      $schema: "http://json-schema.org/draft-07/schema#",
      definitions: {
        ...PRIMITIVE_DEFINITONS,
        ...definitions
      }
    };
    if (funcName) {
      res.$ref = `#/definitions/${funcName}`;
    }
    return res;
  }
}
exports.Spec = Spec;