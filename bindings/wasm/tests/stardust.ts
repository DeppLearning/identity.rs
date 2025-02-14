export {};

const assert = require('assert');
const {
    Duration,
    KeyType,
    MethodScope,
    MethodType,
    MethodRelationship,
    StardustDID,
    StardustDocument,
    StardustService,
    StardustVerificationMethod,
    Timestamp,
} = require("../node");

const aliasIdBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
const aliasIdHex = "0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20";
const networkName = "smr";

describe('StardustDID', function () {
    describe('#constructor', function () {
        it('should work', () => {
            const did = new StardustDID(aliasIdBytes, networkName);
            assert.deepStrictEqual(did.toString(), "did:" + StardustDID.METHOD + ":" + networkName + ":" + aliasIdHex);
            assert.deepStrictEqual(did.tag(), aliasIdHex);
            assert.deepStrictEqual(did.method(), StardustDID.METHOD);
            assert.deepStrictEqual(did.networkStr(), networkName);
            assert.deepStrictEqual(did.authority(), StardustDID.METHOD + ":" + networkName + ":" + aliasIdHex);
            assert.deepStrictEqual(did.methodId(), networkName + ":" + aliasIdHex);
            assert.deepStrictEqual(did.scheme(), "did");
        });
    });
    describe('#placeholder()', function () {
        it('should be zeroes', () => {
            const expectedTag = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const did = StardustDID.placeholder(networkName);
            assert.deepStrictEqual(did.toString(), "did:" + StardustDID.METHOD + ":" + networkName + ":" + expectedTag);
            assert.deepStrictEqual(did.tag(), expectedTag);
            assert.deepStrictEqual(did.method(), StardustDID.METHOD);
            assert.deepStrictEqual(did.networkStr(), networkName);
            assert.deepStrictEqual(did.authority(), StardustDID.METHOD + ":" + networkName + ":" + expectedTag);
            assert.deepStrictEqual(did.methodId(), networkName + ":" + expectedTag);
            assert.deepStrictEqual(did.scheme(), "did");
        });
    });
});

describe('StardustDocument', function () {
    describe('#constructors', function () {
        it('new should generate a placeholder', () => {
            const doc = new StardustDocument(networkName);
            assert.deepStrictEqual(doc.id().toString(), StardustDID.placeholder(networkName).toString());
        });
        it('newWithId should work', () => {
            const did = new StardustDID(aliasIdBytes, networkName);
            const doc = StardustDocument.newWithId(did);
            assert.deepStrictEqual(doc.id().toString(), did.toString());
        });
    });
    describe('#insert/resolve/removeMethod', function () {
        it('should work', async () => {
            const doc = new StardustDocument(networkName);
            const fragment = "new-method-1";
            const scope = MethodScope.AssertionMethod();
            const method = new StardustVerificationMethod(doc.id(), KeyType.Ed25519, aliasIdBytes, fragment);

            // Add.
            doc.insertMethod(method, scope);
            // Resolve.
            const resolved = doc.resolveMethod(fragment, scope);
            assert.deepStrictEqual(resolved.id().fragment(), fragment);
            assert.deepStrictEqual(resolved.type().toString(), MethodType.Ed25519VerificationKey2018().toString());
            assert.deepStrictEqual(resolved.controller().toString(), doc.id().toString());
            assert.deepStrictEqual(resolved.data().tryDecode(), aliasIdBytes);
            assert.deepStrictEqual(resolved.toJSON(), method.toJSON());
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.VerificationMethod()), undefined);
            // List.
            const list = doc.methods();
            assert.deepStrictEqual(list.length, 1);
            assert.deepStrictEqual(list[0].toJSON(), resolved.toJSON());
            // Remove.
            doc.removeMethod(resolved.id());
            assert.deepStrictEqual(doc.resolveMethod(fragment), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, scope), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.VerificationMethod()), undefined);
            assert.deepStrictEqual(doc.methods().length, 0);
        });
    });
    describe('#attach/detachMethodRelationship', function () {
        it('should work', async () => {
            const doc = new StardustDocument(networkName);
            const fragment = "new-method-1";
            const method = new StardustVerificationMethod(doc.id(), KeyType.Ed25519, aliasIdBytes, fragment);
            doc.insertMethod(method, MethodScope.VerificationMethod());
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.VerificationMethod()).toJSON(), method.toJSON());

            // Attach.
            doc.attachMethodRelationship(method.id(), MethodRelationship.Authentication);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.VerificationMethod()).toJSON(), method.toJSON());
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.Authentication()).toJSON(), method.toJSON());
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.AssertionMethod()), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.CapabilityInvocation()), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.CapabilityDelegation()), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.KeyAgreement()), undefined);

            // Detach.
            doc.detachMethodRelationship(method.id(), MethodRelationship.Authentication);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.VerificationMethod()).toJSON(), method.toJSON());
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.Authentication()), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.AssertionMethod()), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.CapabilityInvocation()), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.CapabilityDelegation()), undefined);
            assert.deepStrictEqual(doc.resolveMethod(fragment, MethodScope.KeyAgreement()), undefined);
        });
    });
    describe('#insert/resolve/removeService', function () {
        it('should work', async () => {
            const doc = new StardustDocument(networkName);

            // Add.
            const fragment1 = "new-service-1";
            const service = new StardustService({
                id: doc.id().toUrl().join('#' + fragment1),
                type: ["LinkedDomains", "ExampleType"],
                serviceEndpoint: ["https://example.com/", "https://iota.org/"],
            });
            doc.insertService(service);
            // Resolve.
            const resolved = doc.resolveService(fragment1);
            assert.deepStrictEqual(resolved.id().fragment(), fragment1);
            assert.deepStrictEqual(resolved.type(), ["LinkedDomains", "ExampleType"]);
            assert.deepStrictEqual(resolved.serviceEndpoint(), ["https://example.com/", "https://iota.org/"]);
            assert.deepStrictEqual(resolved.toJSON(), service.toJSON());
            // List.
            const list = doc.service();
            assert.deepStrictEqual(list.length, 1);
            assert.deepStrictEqual(list[0].toJSON(), resolved.toJSON());
            // Remove
            const remove = doc.removeService(resolved.id());
            assert.deepStrictEqual(remove, true);
            assert.deepStrictEqual(doc.resolveService(fragment1), undefined);
            assert.deepStrictEqual(doc.service().length, 0);
        });
    });
    describe('#metadata', function () {
        it('should work', () => {
            const doc = new StardustDocument(networkName);
            const previousCreated = doc.metadataCreated();
            const previousUpdated = doc.metadataUpdated();

            // Created.
            const created = Timestamp.nowUTC().checkedAdd(Duration.seconds(1));
            doc.setMetadataCreated(created);
            assert.deepStrictEqual(doc.metadataCreated().toRFC3339(), created.toRFC3339());
            assert.deepStrictEqual(doc.metadata().created().toRFC3339(), created.toRFC3339());
            assert.notDeepStrictEqual(doc.metadataCreated().toRFC3339(), previousCreated.toRFC3339());
            assert.deepStrictEqual(doc.metadataUpdated().toRFC3339(), previousUpdated.toRFC3339());
            // Updated.
            const updated = Timestamp.nowUTC().checkedAdd(Duration.seconds(42));
            doc.setMetadataUpdated(updated);
            assert.deepStrictEqual(doc.metadataUpdated().toRFC3339(), updated.toRFC3339());
            assert.deepStrictEqual(doc.metadata().updated().toRFC3339(), updated.toRFC3339());
            assert.notDeepStrictEqual(doc.metadataUpdated().toRFC3339(), previousUpdated.toRFC3339());
            assert.deepStrictEqual(doc.metadataCreated().toRFC3339(), created.toRFC3339());
            // Properties.
            assert.deepStrictEqual(doc.metadata().properties(), new Map());
            const properties = new Map()
            properties.set("custom1", "asdf");
            properties.set("custom2", 1234);
            doc.setMetadataPropertyUnchecked("custom1", "asdf");
            doc.setMetadataPropertyUnchecked("custom2", 1234);
            assert.deepStrictEqual(doc.metadata().properties(), properties);
        });
    });
    describe('#properties', function () {
        it('should work', () => {
            const doc = new StardustDocument(networkName);
            assert.deepStrictEqual(doc.properties(), new Map());

            const properties = new Map()
            properties.set("custom1", "asdf");
            properties.set("custom2", 1234);
            doc.setPropertyUnchecked("custom1", "asdf");
            doc.setPropertyUnchecked("custom2", 1234);
            assert.deepStrictEqual(doc.properties(), properties);
        });
    });
});
