import { 
    MintControl 
} from "../../src";


export class TestConfigsEvent {
    title: string;
    description: string;
    location: string;
    host: string;
    date: string;
    constructor(
        title: string,
        description: string,
        location: string,
        host: string,
        date: string,
    ) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.host = host;
        this.date = date;
    }
}

export class TestConfigsChallenge {
    title: string;
    description: string;
    author: string;
    tags: string;
    constructor(
        title: string,
        description: string,
        author: string,
        tags: string,
    ) {
        this.title = title;
        this.description = description;
        this.author = author;
        this.tags = tags;
    }
}

export class TestConfigsPrize {
    mint_control: MintControl;
    quantity: number;
    constructor(
        mint_control: MintControl,
        quantity: number,
    ) {
        this.mint_control = mint_control;
        this.quantity = quantity;
    }
}


export class TestConfigsCustomMint {
    title: string;
    symbol: string;
    uri: string;
    decimals: number;
    constructor(
        title: string,
        symbol: string,
        uri: string,
        decimals: number,
    ) {
        this.title = title;
        this.symbol = symbol;
        this.uri = uri;
        this.decimals = decimals;
    }
}
