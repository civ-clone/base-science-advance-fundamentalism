import Fundamentalism from '../Fundamentalism';
import Advance from '@civ-clone/core-science/Advance';
import ClassRegistry from '@civ-clone/core-data-object/ClassRegistry';
import Government from '@civ-clone/core-government/Government';
import { instance as advanceRegistry } from '@civ-clone/core-science/AdvanceRegistry';
import { instance as ruleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { existsSync, readFileSync } from 'fs';
import { expect } from 'chai';
import { join } from 'path';
import { typeNameOf } from '@civ-clone/core-data-object/DataObject';

describe('Fundamentalism', (): void => {
  it('should extend Advance directly', (): void => {
    expect(Object.getPrototypeOf(Fundamentalism)).to.equal(Advance);
  });

  it('should be saved as FundamentalismAdvance, so a Government of the same name can be saved too', (): void => {
    class FundamentalismGovernment extends Government {}

    // The name a save would record for the other kind: the class name, as base-government-* classes have no tag.
    Object.defineProperty(FundamentalismGovernment, 'name', {
      value: 'Fundamentalism',
    });

    const classRegistry = new ClassRegistry();

    expect(typeNameOf(Fundamentalism)).to.equal('FundamentalismAdvance');
    expect((): void =>
      classRegistry.register(Fundamentalism, FundamentalismGovernment)
    ).not.to.throw();
    expect(classRegistry.get('FundamentalismAdvance')).to.equal(Fundamentalism);
    expect(classRegistry.get('Fundamentalism')).to.equal(
      FundamentalismGovernment
    );
  });

  it('should be a library that registers nothing', (): void => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );

    ['main', 'module', 'exports', 'bin'].forEach((field: string): void => {
      expect(packageJson).not.to.have.property(field);
    });
    expect(existsSync(join(process.cwd(), 'index.ts'))).to.be.false;
    expect(existsSync(join(process.cwd(), 'index.js'))).to.be.false;

    const entries = (): unknown[][] => [
        ruleRegistry.entries(),
        advanceRegistry.entries(),
      ],
      before = entries(),
      path = require.resolve('../Fundamentalism');

    // Load the module afresh, as a plugin loader importing it would.
    delete require.cache[path];
    require(path);

    const after = entries();

    after.forEach((list: unknown[], index: number): void => {
      expect(list).to.have.ordered.members(before[index]);
    });
  });
});
