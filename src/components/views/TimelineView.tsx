// import { For } from "solid-js";
// import { TimelineLayoutItem } from "../../lib/timelineLayout";
// import styles from "./TimelineView.module.scss";

// interface TimelineViewProps {
//     items: any[];
//     layout: TimelineLayoutItem[];
// }

// export default function TimelineView(props: TimelineViewProps) {
//     return (
//         <div class={styles.timelineView}>
//             <ul style="position:relative">
//                 <For each={props.layout}>
//                     {({ item, x, y }) => (
//                         <li
//                             style={{
//                                 position: "absolute",
//                                 left: `${x * 100}px`,
//                                 top: `${y * 2}px`,
//                             }}
//                         >
//                             {item.renderCompact()}
//                         </li>
//                     )}
//                 </For>
//             </ul>
//         </div>
//     );
// }
