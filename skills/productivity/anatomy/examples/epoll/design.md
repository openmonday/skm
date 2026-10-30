# Epoll Figure

## Concept

One event-dispatch instrument watches several socket buffers: `epoll_ctl` keeps each fd registered, readiness raises that fd's flag in the ready rail, `epoll_wait` copies only ready events to the application tray, and `read` drains the socket buffer separately.

The moving event tags represent returned `epoll_event` records, not payload bytes. The watcher rack uses a tree-like index as a picture of Linux's current implementation; the API promises the registration/readiness semantics, not a red-black tree ABI.

## Parts List

- Base (11): bedplate; four feet; four corner screws; perimeter groove; engraved epoll plate.
- Structure (11): four uprights; two long rails; two cross-braces; two event-tray guide rails; upper bridge.
- Socket inputs (12): three socket barrels; three collars; three contact pins; three receive-buffer pans.
- Registration index (12): one watch-rack bed; one root node; two branch nodes; three fd leaf nodes; five branch links.
- Ready rail (8): trough floor; two side rails; two end stops; three per-fd readiness flags.
- Wait control (6): two lever supports; pivot axle; sliding handle; grip; return spring.
- User event array (8): tray floor; two rails; two dividers; three returned-event tags.

There are 68 named structural parts before packet tokens, fasteners, seams and detail. Only the selected returned-event tag uses the lit accent.

## Interaction Model

The demo has three registered fds (17, 23, 42). Captions advance one step at a time: the practical problem, fd registration, data arrival, `epoll_wait`, `read`, and a second wait comparing LT with ET. Each arrival adds 2 KiB to that socket's receive buffer; each `read` removes 1 KiB. The event tag represents a returned `epoll_event`, never payload bytes. LT remains ready while bytes remain; ET consumes its edge notification at wait time and does not notify again until the buffer drains to empty and becomes ready again. Automatic playback is disabled so each caption stays visible until the learner advances.
