import Image from "next/image";
import styles from "./page.module.css";
import dynamic from 'next/dynamic';
const SeaMap = dynamic(() => import('./components/sea_map'), { ssr: false });
import OperateLayer from "./components/operate_layer";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SeaMap></SeaMap>
        <OperateLayer></OperateLayer>
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
