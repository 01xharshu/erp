"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  CalendarDays,
  CreditCard,
  Database,
  Globe,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveNode = "hub" | "dest" | null;

type SourceNode = {
  id: string;
  icon: ReactNode;
  y: number;
};

type Point = {
  x: number;
  y: number;
};

const SOURCES: SourceNode[] = [
  { id: "students", icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />, y: 70 },
  { id: "faculty", icon: <UserCog className="h-4 w-4 sm:h-5 sm:w-5" />, y: 130 },
  { id: "timetable", icon: <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />, y: 190 },
  { id: "attendance", icon: <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />, y: 250 },
  { id: "fees", icon: <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />, y: 310 },
  { id: "assistant", icon: <Bot className="h-4 w-4 sm:h-5 sm:w-5" />, y: 370 },
];

const HUB_POS: Point = { x: 450, y: 200 };
const DEST_POS: Point = { x: 760, y: 200 };
const START_X = 92;
const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 440;

const DEST_PARTICLES = [
  { x: -44, y: -24 },
  { x: -18, y: -48 },
  { x: 28, y: -38 },
  { x: 48, y: -8 },
  { x: 40, y: 34 },
  { x: 14, y: 48 },
  { x: -22, y: 44 },
  { x: -46, y: 18 },
];

function Node({
  icon,
  className,
  children,
  isActive,
  style,
  small,
}: {
  icon: ReactNode;
  className?: string;
  children?: ReactNode;
  isActive?: boolean;
  style?: CSSProperties;
  small?: boolean;
}) {
  return (
    <motion.div
      style={style}
      animate={
        isActive
          ? {
              scale: [1, 1.05, 1],
              borderColor: ["#D1D5DB", "#3B82F6", "#D1D5DB"],
              boxShadow: [
                "0 0 0px rgba(59,130,246,0)",
                "0 0 20px rgba(59,130,246,0.2)",
                "0 0 0px rgba(59,130,246,0)",
              ],
            }
          : {}
      }
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className={cn(
        "absolute z-10 flex items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 bg-white/90 shadow-sm transition-colors dark:border-white/10 dark:bg-black/30",
        small
          ? "h-8 w-8 sm:h-14 sm:w-14"
          : "h-10 w-10 sm:h-14 sm:w-14",
        className
      )}
    >
      {icon}
      {children}
    </motion.div>
  );
}

function FlowPath({
  start,
  end,
  delay = 0,
  duration = 2,
  isMain = false,
}: {
  start: Point;
  end: Point;
  delay?: number;
  duration?: number;
  isMain?: boolean;
}) {
  const pathData = `M ${start.x} ${start.y} C ${(start.x + end.x) / 2} ${start.y}, ${(start.x + end.x) / 2} ${end.y}, ${end.x} ${end.y}`;
  const particleStyle = { offsetPath: `path("${pathData}")` } as CSSProperties;

  return (
    <>
      <path d={pathData} fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" className="opacity-40" />
      <motion.path
        d={pathData}
        fill="none"
        stroke={isMain ? "#3B82F6" : "#93C5FD"}
        strokeWidth={isMain ? "3" : "2"}
        strokeLinecap="round"
        initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 0.3, 0.3, 0],
          pathOffset: [0, 0, 1, 1],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
          repeatDelay: isMain ? 0.2 : 0.5,
        }}
      />
      <motion.circle
        r={isMain ? "3" : "2"}
        fill={isMain ? "#2563EB" : "#3B82F6"}
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          offsetDistance: ["0%", "100%"],
        }}
        style={particleStyle}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
          repeatDelay: isMain ? 0.2 : 0.5,
        }}
      />
    </>
  );
}

export function NucleusArchitecture({ className }: { className?: string }) {
  const [activeNode, setActiveNode] = useState<ActiveNode>(null);
  const xPct = (x: number): string => `${(x / VIEWBOX_WIDTH) * 100}%`;
  const yPct = (y: number): string => `${(y / VIEWBOX_HEIGHT) * 100}%`;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode("hub");
      setTimeout(() => setActiveNode("dest"), 800);
      setTimeout(() => setActiveNode(null), 1800);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl border border-border/70 bg-background/65", className)}>
      <div className="relative aspect-[900/440] w-full overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }}
        />

        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 900 440" preserveAspectRatio="xMidYMid meet">
          {SOURCES.map((src, index) => (
            <FlowPath
              key={src.id}
              start={{ x: START_X, y: src.y }}
              end={HUB_POS}
              delay={index * 0.35}
              duration={1.8}
            />
          ))}
          <FlowPath start={HUB_POS} end={DEST_POS} delay={1} duration={1.2} isMain />
        </svg>

        {SOURCES.map((src) => (
          <Node
            key={src.id}
            icon={src.icon}
            small
            className="-translate-x-1/2 text-slate-500 dark:text-slate-300"
            style={{ left: xPct(START_X), top: yPct(src.y), transform: "translate(-50%, -50%)" }}
          />
        ))}

        <Node
          isActive={activeNode === "hub"}
          icon={
            <Database
              className={cn(
                "h-5 w-5 sm:h-6 sm:w-6 transition-colors",
                activeNode === "hub" ? "text-blue-500" : "text-slate-700 dark:text-slate-200"
              )}
            />
          }
          className="bg-white dark:bg-black/40"
          style={{ left: xPct(HUB_POS.x), top: yPct(HUB_POS.y - 20), transform: "translate(-50%, -50%)" }}
        />

  
        <div className="absolute z-10" style={{ left: xPct(DEST_POS.x), top: yPct(DEST_POS.y), transform: "translate(-50%, -50%)" }}>
          <motion.div
            animate={{
              boxShadow:
                activeNode === "dest"
                  ? [
                      "0 0 20px rgba(59,130,246,0.35)",
                      "0 0 58px rgba(59,130,246,0.65)",
                      "0 0 20px rgba(59,130,246,0.35)",
                    ]
                  : "0 10px 30px -5px rgba(59,130,246,0.3)",
            }}
            className="relative flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-[1.75rem] bg-[#3B82F6] shadow-xl"
          >
            <Globe className="h-5 w-5 sm:h-8 sm:w-8 text-white" />

            <AnimatePresence>
              {activeNode === "dest" &&
                DEST_PARTICLES.map((particle, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1.15, 0],
                      x: particle.x * 0.6,
                      y: particle.y * 0.6,
                      opacity: [0, 1, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.03 }}
                    className="absolute h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-blue-200 blur-[1px]"
                  />
                ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}