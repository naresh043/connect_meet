import { Link } from "react-router-dom";

import {
  Video,
  ArrowRight,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F6F7FB] text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="relative z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-indigo-600
                text-white
                shadow-sm
                shadow-indigo-200
              "
            >
              <Video size={18} strokeWidth={2.3} />
            </div>

            <span className="text-lg font-bold tracking-tight text-slate-950">
              ConnectMeet
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="
                rounded-lg
                px-3
                py-2
                text-sm
                font-semibold
                text-slate-600
                transition-colors
                hover:bg-slate-100
                hover:text-slate-900
                cursor-pointer
                sm:px-4
              "
            >
              Login
            </Link>

            <Link
              to="/register"
              className="
                rounded-lg
                bg-indigo-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                shadow-sm
                shadow-indigo-200/50
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-indigo-700
                hover:shadow-md
                cursor-pointer
                sm:px-5
              "
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>
        <section className="relative">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full bg-cyan-100/50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div
                className="
                  mx-auto
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-indigo-100
                  bg-indigo-50
                  px-3.5
                  py-1.5
                  text-xs
                  font-semibold
                  text-indigo-600
                "
              >
                <Sparkles size={13} />
                Simple. Fast. Connected.
              </div>

              {/* Heading */}
              <h1
                className="
                  mt-6
                  text-4xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-slate-950
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                Video meetings,
                <span className="block text-indigo-600">made simple.</span>
              </h1>

              {/* Description */}
              <p
                className="
                  mx-auto
                  mt-6
                  max-w-2xl
                  text-base
                  leading-7
                  text-slate-500
                  sm:text-lg
                "
              >
                Connect with your team, friends, and clients through reliable
                real-time video meetings. Create a meeting, share the ID, and
                start talking.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-indigo-600
                    px-6
                    text-sm
                    font-semibold
                    text-white
                    shadow-md
                    shadow-indigo-200/50
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-indigo-700
                    hover:shadow-lg
                    hover:shadow-indigo-200/60
                    cursor-pointer
                    sm:w-auto
                  "
                >
                  Create free account
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/login"
                  className="
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    text-sm
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-indigo-200
                    hover:bg-indigo-50
                    hover:text-indigo-600
                    cursor-pointer
                    sm:w-auto
                  "
                >
                  Sign in
                </Link>
              </div>

              {/* Trust text */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Easy to use
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Real-time communication
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  No complicated setup
                </span>
              </div>
            </div>

            {/* ================= PRODUCT PREVIEW ================= */}
            <div className="mx-auto mt-14 max-w-5xl sm:mt-16">
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                  shadow-slate-200/60
                "
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </div>

                  <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                    <Video size={13} />
                    ConnectMeet
                  </div>

                  <div className="h-7 w-16 rounded-md bg-slate-100" />
                </div>

                {/* Preview Content */}
                <div className="bg-slate-950 p-3 sm:p-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Participant 1 */}
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
                          N
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        Naresh (You)
                      </div>

                      <div className="absolute right-2 top-2 rounded-lg bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold text-white">
                        Live
                      </div>
                    </div>

                    {/* Participant 2 */}
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-xl font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
                          A
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        Alex
                      </div>
                    </div>
                  </div>

                  {/* Fake Controls */}
                  <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 sm:h-10 sm:w-10">
                      <Video size={16} />
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 sm:h-10 sm:w-10">
                      <Users size={16} />
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white sm:h-10 sm:w-10">
                      <ArrowRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="border-t border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-indigo-600">
                Everything you need
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Built for effortless conversations
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
                ConnectMeet keeps video meetings focused, simple, and easy to
                join.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200/80
                  bg-slate-50/60
                  p-6
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-indigo-100
                  hover:bg-white
                  hover:shadow-md
                  cursor-default
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Video size={20} />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Real-time video
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Meet face-to-face with smooth real-time video and audio
                  communication.
                </p>
              </div>

              {/* Feature 2 */}
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200/80
                  bg-slate-50/60
                  p-6
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-cyan-100
                  hover:bg-white
                  hover:shadow-md
                  cursor-default
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Users size={20} />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Easy collaboration
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create a meeting and invite others using a simple meeting ID.
                </p>
              </div>

              {/* Feature 3 */}
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200/80
                  bg-slate-50/60
                  p-6
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-emerald-100
                  hover:bg-white
                  hover:shadow-md
                  cursor-default
                "
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={20} />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Simple & secure
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A straightforward meeting experience designed around reliable
                  communication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="bg-[#F6F7FB]">
          <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200/50">
              <Zap size={20} />
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Ready to start your meeting?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Create your ConnectMeet account and start connecting with your
              participants today.
            </p>

            <Link
              to="/register"
              className="
                mt-7
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-6
                text-sm
                font-semibold
                text-white
                shadow-md
                shadow-indigo-200/50
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-indigo-700
                hover:shadow-lg
                cursor-pointer
              "
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Video size={14} />
            </div>

            <span className="text-sm font-semibold text-slate-700">
              ConnectMeet
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Real-time video meetings made simple.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
