# counter_seahorse
# Built with Seahorse v0.1.6

from seahorse.prelude import *

declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')


class Counter(Account):
    count: u64


@instruction
def increment(counter: Empty[Counter], owner: Signer):
    counter.init(
        payer=owner,
        seeds=[owner]
    )
    counter.count += 1
