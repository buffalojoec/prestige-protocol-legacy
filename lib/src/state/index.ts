export * from './badge';
export * from './challenge';
export * from './event';
export * from './user';

import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { Struct } from '@solana/web3.js';
import { FixedPrize } from './challenge';


export class PrestigeMintAuthority {

    bump: number;

    constructor(props: {
        bump: number,
    }) {
        this.bump = props.bump;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(PrestigeMintAuthoritySchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(PrestigeMintAuthoritySchema, PrestigeMintAuthority, buffer);
    }
}

export const PrestigeMintAuthoritySchema = new Map([
    [ PrestigeMintAuthority, { 
        kind: 'struct', 
        fields: [ 
            ['bump', 'u8'],
        ],
    }]
]);

export class COption extends Struct {
    
    constructor(properties: any) {
      super(properties);
    }

    static fromFixedPrize(fixedPrize?: FixedPrize): COption {
      if (fixedPrize == undefined) {
        return new COption({
          some: 0,
          pubKeyBuffer: new Uint8Array(32),
        });
      } else {
        return new COption({
          some: 1,
          pubKeyBuffer: fixedPrize.toBuffer(),
        });
      }
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(COptionSchema, this)) 
    }

    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(COptionSchema, COption, buffer);
    }
}

export const COptionSchema = new Map([
    [ COption, { 
        kind: 'struct', 
        fields: [ 
            ['some', 'u32'],
            ['buffer', [32]],
        ],
    }]
]);