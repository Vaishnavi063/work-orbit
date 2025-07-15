import {
  Code,
  PenTool,
  Camera,
  BarChart2,
  MonitorSpeaker,
  Edit3,
  Settings,
  Globe,
  Cpu,
  Database,
  Smartphone,
  Layout,
} from "lucide-react";
import type { CategoryType } from "@/types";

const CATEGORIES: CategoryType[] = [
  {
    id: 1,
    title: "Web Development",
    available: 124,
    Icon: Code,
    color: "text-blue-500",
  },
  {
    id: 2,
    title: "Graphic Design",
    available: 98,
    Icon: PenTool,
    color: "text-pink-500",
  },
  {
    id: 3,
    title: "Photography",
    available: 57,
    Icon: Camera,
    color: "text-yellow-500",
  },
  {
    id: 4,
    title: "Marketing",
    available: 76,
    Icon: BarChart2,
    color: "text-green-500",
  },
  {
    id: 5,
    title: "Video Editing",
    available: 42,
    Icon: MonitorSpeaker,
    color: "text-purple-500",
  },
  {
    id: 6,
    title: "Content Writing",
    available: 89,
    Icon: Edit3,
    color: "text-red-500",
  },
  {
    id: 7,
    title: "IT & Networking",
    available: 38,
    Icon: Settings,
    color: "text-gray-600",
  },
  {
    id: 8,
    title: "Translation",
    available: 24,
    Icon: Globe,
    color: "text-indigo-500",
  },
  {
    id: 9,
    title: "SWE",
    available: 65,
    Icon: Cpu,
    color: "text-teal-500",
  },
  {
    id: 10,
    title: "AI-ML",
    available: 30,
    Icon: Database,
    color: "text-orange-500",
  },
  {
    id: 11,
    title: "Mobile Development",
    available: 52,
    Icon: Smartphone,
    color: "text-cyan-500",
  },
  {
    id: 12,
    title: "UI-UX Designer",
    available: 10,
    Icon: Layout,
    color: "text-purple-600",
  },
];

export { CATEGORIES };
