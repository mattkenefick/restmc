import { expect } from 'chai';
import { compactObjectHash, stableStringify } from '../../src/Utility.ts';

/**
 * Tests for the pure helpers in src/Utility.ts. These helpers power
 * the uniqueKey system on ActiveRecord, so their determinism and
 * circular-reference handling matter for change detection downstream.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('Utility', () => {
	describe('stableStringify', () => {
		it('should stringify primitives', () => {
			expect(stableStringify(5)).to.equal('5');
			expect(stableStringify('foo')).to.equal('"foo"');
			expect(stableStringify(null)).to.equal('null');
			expect(stableStringify(true)).to.equal('true');
		});

		it('should stringify a flat object with sorted keys', () => {
			const result: string = stableStringify({ b: 2, a: 1 });

			expect(result).to.equal('{"a":1,"b":2}');
		});

		it('should produce identical output regardless of key order', () => {
			const a: string = stableStringify({ alpha: 1, beta: 2, gamma: 3 });
			const b: string = stableStringify({ gamma: 3, beta: 2, alpha: 1 });

			expect(a).to.equal(b);
		});

		it('should stringify nested objects and arrays', () => {
			const result: string = stableStringify({ list: [1, 2, { z: 'z', a: 'a' }] });

			expect(result).to.equal('{"list":[1,2,{"a":"a","z":"z"}]}');
		});

		it('should guard against circular references', () => {
			const obj: any = { name: 'parent' };
			obj.self = obj;

			const result: string = stableStringify(obj);

			expect(result).to.contain('"[Circular]"');
		});
	});

	describe('compactObjectHash', () => {
		it('should return the same hash for equal objects regardless of key order', () => {
			const a: string = compactObjectHash({ x: 1, y: 2 });
			const b: string = compactObjectHash({ y: 2, x: 1 });

			expect(a).to.equal(b);
			expect(a).to.be.a('string');
			expect(a.length).to.be.greaterThan(0);
		});

		it('should return different hashes for different objects', () => {
			const a: string = compactObjectHash({ x: 1 });
			const b: string = compactObjectHash({ x: 2 });

			expect(a).to.not.equal(b);
		});

		it('should only contain base64url-safe characters', () => {
			const hash: string = compactObjectHash({ x: 1, y: 2, deeply: { nested: [1, 2, 3] } });

			expect(hash).to.match(/^[A-Za-z0-9_-]+$/);
		});
	});
});
