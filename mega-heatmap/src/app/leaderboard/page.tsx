"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLeaderboard, type TimeFrame, type SortMetric } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

const TIMEFRAMES: { value: TimeFrame; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all-time", label: "All Time" },
];

const SORT_OPTIONS: { value: SortMetric; label: string }[] = [
  { value: "transactions", label: "Transactions" },
  { value: "streak", label: "Streak" },
  { value: "activeDays", label: "Active Days" },
];

export default function LeaderboardPage() {
  const {
    entries,
    timeframe,
    sortBy,
    stats,
    isLoading,
    isOnLeaderboard,
    joinLeaderboard,
    leaveLeaderboard,
    setTimeframe,
    setSortBy,
    getRank,
  } = useLeaderboard();

  const { address, isConnected } = useAccount();

  const myRank = address ? getRank(address) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full animate-spin"
          style={{
            border: "3px solid #1a1617",
            borderTopColor: "#eb4511",
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "#dfdadb" }}>
            Leaderboard
          </h1>
          <p style={{ color: "#878283" }}>
            Top MegaETH users ranked by on-chain activity
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#eb4511" }}>
              {stats.totalUsers}
            </p>
            <p className="text-xs" style={{ color: "#878283" }}>
              Users
            </p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#eb4511" }}>
              {stats.totalTransactions.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: "#878283" }}>
              Total Txs
            </p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#eb4511" }}>
              {stats.topStreak}
            </p>
            <p className="text-xs" style={{ color: "#878283" }}>
              Top Streak
            </p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold truncate" style={{ color: "#eb4511" }}>
              {stats.mostActiveUser || "-"}
            </p>
            <p className="text-xs" style={{ color: "#878283" }}>
              Most Active
            </p>
          </div>
        </motion.div>

        {/* Timeframe Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-4 overflow-x-auto pb-2"
        >
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={cn(
                "px-4 py-2 rounded-sm text-sm font-medium transition-all whitespace-nowrap",
                timeframe === tf.value ? "ring-1" : ""
              )}
              style={{
                backgroundColor: timeframe === tf.value ? "rgba(235, 69, 17, 0.2)" : "#111011",
                color: timeframe === tf.value ? "#eb4511" : "#878283",
                borderColor: timeframe === tf.value ? "#eb4511" : "transparent",
              }}
            >
              {tf.label}
            </button>
          ))}
        </motion.div>

        {/* Sort By */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="text-sm" style={{ color: "#878283" }}>
            Sort by:
          </span>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={cn(
                  "px-3 py-1 rounded-sm text-xs font-medium transition-all",
                  sortBy === opt.value ? "" : "hover:opacity-80"
                )}
                style={{
                  backgroundColor: sortBy === opt.value ? "#eb4511" : "transparent",
                  color: sortBy === opt.value ? "#0a0909" : "#878283",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Join/Leave Leaderboard - Connected */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-4 mb-6 flex items-center justify-between"
          >
            <div>
              {isOnLeaderboard ? (
                <>
                  <p className="font-medium" style={{ color: "#dfdadb" }}>
                    You're on the leaderboard!
                  </p>
                  <p className="text-sm" style={{ color: "#878283" }}>
                    Current rank: #{myRank || "-"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium" style={{ color: "#dfdadb" }}>
                    Join the leaderboard
                  </p>
                  <p className="text-sm" style={{ color: "#878283" }}>
                    Compete with other MegaETH users
                  </p>
                </>
              )}
            </div>
            {isOnLeaderboard ? (
              <button
                onClick={leaveLeaderboard}
                className="px-4 py-2 rounded-sm text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: "#1a1617", color: "#878283" }}
              >
                Leave
              </button>
            ) : (
              <button
                onClick={() => joinLeaderboard()}
                className="px-4 py-2 rounded-sm text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: "#eb4511", color: "#0a0909" }}
              >
                Join
              </button>
            )}
          </motion.div>
        )}

        {/* Not Connected CTA */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-4 mb-6 flex items-center justify-between"
          >
            <div>
              <p className="font-medium" style={{ color: "#dfdadb" }}>
                Connect wallet to join
              </p>
              <p className="text-sm" style={{ color: "#878283" }}>
                Compete with other MegaETH users
              </p>
            </div>
            <ConnectButton />
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-medium mb-2" style={{ color: "#dfdadb" }}>
                No entries yet
              </p>
              <p className="text-sm" style={{ color: "#878283" }}>
                Be the first to join the leaderboard!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1a1617]">
              {/* Header */}
              <div
                className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium"
                style={{ color: "#878283", backgroundColor: "#0a0909" }}
              >
                <div className="col-span-1">#</div>
                <div className="col-span-5">User</div>
                <div className="col-span-2 text-right">Txs</div>
                <div className="col-span-2 text-right">Streak</div>
                <div className="col-span-2 text-right">Days</div>
              </div>

              {/* Entries */}
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isMe = address?.toLowerCase() === entry.walletAddress.toLowerCase();

                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * Math.min(index, 10) }}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors",
                      isMe ? "" : "hover:bg-[#111011]"
                    )}
                    style={{
                      backgroundColor: isMe ? "rgba(235, 69, 17, 0.1)" : "transparent",
                    }}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      <span
                        className={cn(
                          "font-bold",
                          rank <= 3 ? "text-lg" : "text-sm"
                        )}
                        style={{
                          color:
                            rank === 1
                              ? "#FFD700"
                              : rank === 2
                              ? "#C0C0C0"
                              : rank === 3
                              ? "#CD7F32"
                              : "#454041",
                        }}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* User */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      {entry.displayPfp ? (
                        <img
                          src={entry.displayPfp}
                          alt={entry.displayName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: "#eb4511",
                            color: "#0a0909",
                          }}
                        >
                          {entry.displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p
                          className="font-medium truncate text-sm"
                          style={{ color: "#dfdadb" }}
                        >
                          {entry.displayName}
                          {isMe && (
                            <span
                              className="ml-2 text-xs px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: "#eb4511", color: "#0a0909" }}
                            >
                              You
                            </span>
                          )}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "#878283" }}
                        >
                          {entry.displayUsername}
                        </p>
                      </div>
                    </div>

                    {/* Transactions */}
                    <div className="col-span-2 text-right">
                      <span
                        className="font-bold"
                        style={{ color: sortBy === "transactions" ? "#eb4511" : "#dfdadb" }}
                      >
                        {timeframe === "all-time"
                          ? entry.totalTransactions.toLocaleString()
                          : entry.periodTransactions.toLocaleString()}
                      </span>
                    </div>

                    {/* Streak */}
                    <div className="col-span-2 text-right">
                      <span
                        className="font-bold"
                        style={{ color: sortBy === "streak" ? "#eb4511" : "#dfdadb" }}
                      >
                        {entry.currentStreak}
                      </span>
                      <span className="text-xs ml-1" style={{ color: "#878283" }}>
                        days
                      </span>
                    </div>

                    {/* Active Days */}
                    <div className="col-span-2 text-right">
                      <span
                        className="font-bold"
                        style={{ color: sortBy === "activeDays" ? "#eb4511" : "#dfdadb" }}
                      >
                        {entry.activeDays}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-xs" style={{ color: "#454041" }}>
            Rankings update when users sync their transaction data
          </p>
        </motion.div>
      </div>
    </div>
  );
}
