"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHome, FiUsers, FiInbox, FiUser, FiSettings } from "react-icons/fi";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: <FiHome /> },
  { label: "Following", href: "/following", icon: <FiUsers /> },
  { label: "Inbox", href: "/inbox", icon: <FiInbox /> },
  { label: "Profile", href: "/profile", icon: <FiUser /> },
  { label: "Settings", href: "/settings", icon: <FiSettings /> },
];

export default function SideNav() {
  const router = useRouter();

  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40 transition-all duration-200"
      style={{ minWidth: 256 }}
    >
      {/* Logo/Placeholder */}
      <div className="flex items-center px-4 py-6">
        <span className="text-2xl font-bold text-teal-400">Goysly</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 mt-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-teal-600/20 transition"
          >
            <span className="text-teal-400 text-xl">{item.icon}</span>
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Placeholder for user/avatar */}
      <div className="px-4 py-6 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold">
            U
          </div>
          <div>
            <div className="font-semibold text-white">Username</div>
            <div className="text-xs text-zinc-400">View Profile</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
