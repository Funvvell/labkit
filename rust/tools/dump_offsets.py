"""Dump the ctypes field offsets of the SDPC DLL structures.

Run with the Python interpreter that has `sdpc-for-python` installed::

    python tools/dump_offsets.py

The printed offsets are the *in-memory* layout used by the DLL's returned
pointer. Do NOT use the on-disk PIC_HEAD_FILE_SIZE (160) instead:
ctypes.sizeof(SqPicHead) is 153 because the Python definition omits
`vender` (1 byte) and 2 bytes of `headSpace`.
"""

from __future__ import annotations

import ctypes

from sdpc.Sdpc_struct import SqPicHead, SqSdpcInfo


def dump(structure: type[ctypes.Structure]) -> None:
    print(f"# {structure.__name__} sizeof={ctypes.sizeof(structure)}")
    for name, field_type in structure._fields_:
        descriptor = getattr(structure, name)
        print(
            f"{structure.__name__}.{name}: offset={descriptor.offset} "
            f"size={descriptor.size} type={getattr(field_type, '__name__', str(field_type))}"
        )


if __name__ == "__main__":
    dump(SqSdpcInfo)
    print()
    dump(SqPicHead)
