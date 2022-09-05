# echo_seahorse
# Built with Seahorse v0.1.6

from seahorse.prelude import *

declare_id('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')


@instruction
def echo(signer: Signer, message: String):
    # We are just going to print the message
    print(f"{signer.key}: {message}")
