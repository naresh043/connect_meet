import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  LogOut,
  Video,
  Users,
  Clock3,
  Plus,
  ArrowRight,
  Zap,
  ChevronDown,
  Settings,
  User,
  CheckCircle2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { logout } from "../features/auth/authSlice";

import {
  getMyMeetings,
  clearMeetingError,
} from "../features/meetings/meetingSlice";

import CreateMeeting from "../components/dashboard/CreateMeeting";
import JoinMeeting from "../components/dashboard/JoinMeeting";
import MeetingCard from "../components/dashboard/MeetingCard";
import MeetingCardSkeleton from "../components/dashboard/MeetingCardSkeleton";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const {
    meetings = [],
    isLoading,
    error,
  } = useSelector((state) => state.meetings);

  useEffect(() => {
    dispatch(getMyMeetings());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")?.[0] || "there";

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-slate-900">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav
        className="
          sticky
          top-0
          z-50
          border-b
          border-slate-200/80
          bg-white/85
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[68px]
            max-w-7xl
            items-center
            justify-between
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* BRAND */}

          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="
    flex
    h-10
    w-10
    items-center
    justify-center
    rounded-xl
    bg-indigo-600
    shadow-md
    shadow-indigo-200/60
  "
              >
                <Video size={19} color="white" strokeWidth={2.5} />
              </div>

              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-white
                  bg-emerald-400
                "
              />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-950">
                ConnectMeet
              </h1>

              <p
                className="
                  hidden
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                  sm:block
                "
              >
                Meet. Connect. Collaborate.
              </p>
            </div>
          </div>

          {/* USER MENU */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="
                  h-auto
                  gap-2
                  rounded-xl
                  px-2
                  py-1.5
                  hover:bg-slate-100
                "
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name || "User"}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Personal workspace
                  </p>
                </div>

                <Avatar className="h-9 w-9 ring-4 ring-slate-100">
                  <AvatarFallback
                    className="
                      bg-gradient-to-br
                      from-slate-800
                      to-slate-950
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {userInitial}
                  </AvatarFallback>
                </Avatar>

                <ChevronDown
                  size={15}
                  className="hidden text-slate-400 sm:block"
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem className="gap-2">
                <User size={15} />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-2">
                <Settings size={15} />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="
                  gap-2
                  text-red-600
                  focus:bg-red-50
                  focus:text-red-600
                "
              >
                <LogOut size={15} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          mx-auto
          max-w-7xl
          px-4
          py-7
          sm:px-6
          sm:py-9
          lg:px-8
        "
      >
        {/* HERO */}

        <section
          className="
            relative
            mb-7
            overflow-hidden
            rounded-3xl
            border
            border-slate-200/80
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_90%_10%,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_70%_100%,rgba(6,182,212,0.05),transparent_30%)]
            "
          />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div
              className="
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              <div>
                <Badge
                  variant="secondary"
                  className="
                    mb-4
                    rounded-full
                    border
                    border-indigo-100
                    bg-indigo-50
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-indigo-600
                    hover:bg-indigo-50
                  "
                >
                  <Zap size={13} />
                  Meeting workspace
                </Badge>

                <h2
                  className="
                    max-w-3xl
                    text-3xl
                    font-bold
                    tracking-[-0.03em]
                    text-slate-950
                    sm:text-4xl
                    lg:text-[42px]
                  "
                >
                  Welcome back,{" "}
                  <span className="text-indigo-600">{firstName}</span>
                </h2>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                    sm:text-base
                  "
                >
                  Start a new meeting or jump into an existing conversation.
                  Everything you need is right here.
                </p>
              </div>

              <Card className="hidden border-slate-200 bg-white/80 shadow-sm lg:block">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-50
                    "
                  >
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Platform
                    </p>

                    <p className="text-sm font-bold text-slate-800">
                      All systems operational
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Meetings
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {meetings.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Video size={18} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Experience
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    HD Video
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Users size={18} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-950">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Clock3 size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ERROR */}

        {error && (
          <div
            className="
              mb-6
              flex
              items-start
              justify-between
              gap-4
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-700
            "
          >
            <div className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <span>{error}</span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => dispatch(clearMeetingError())}
              className="
                h-7
                w-7
                text-red-500
                hover:bg-red-100
                hover:text-red-700
              "
            >
              ×
            </Button>
          </div>
        )}

        {/* ACTIONS */}

        <section className="mb-10">
          <div
            className="
              mb-5
              flex
              items-end
              justify-between
            "
          >
            <div>
              <p
                className="
                  mb-1
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-indigo-600
                "
              >
                Get started
              </p>

              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Start or join a meeting
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Connect with your team in seconds.
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
              <Plus size={14} />
              Quick actions
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CreateMeeting />
            <JoinMeeting />
          </div>
        </section>

        {/* HISTORY */}

        <section>
          <div
            className="
              mb-5
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  mb-1
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-indigo-600
                "
              >
                Activity
              </p>

              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Your meetings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Access your recently created meetings.
              </p>
            </div>

            <Badge
              variant="outline"
              className="
                self-start
                gap-2
                rounded-full
                border-slate-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-slate-600
                shadow-sm
              "
            >
              <Video size={13} />
              {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
            </Badge>
          </div>

          {/* SKELETON */}

          {isLoading && (
            <div className="space-y-3">
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
            </div>
          )}

          {/* EMPTY */}

          {!isLoading && meetings.length === 0 && (
            <div
              className="
                  rounded-3xl
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  px-6
                  py-16
                  text-center
                  shadow-sm
                "
            >
              <div
                className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-indigo-50
                    to-violet-100
                    text-indigo-600
                  "
              >
                <Video size={25} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Your meeting history is empty
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first meeting above and it will appear here for
                quick access.
              </p>
            </div>
          )}

          {/* MEETINGS */}

          {!isLoading && meetings.length > 0 && (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer className="mt-12 pt-6">
          <Separator className="mb-6" />

          <div
            className="
              flex
              flex-col
              gap-2
              text-xs
              text-slate-400
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p>© {new Date().getFullYear()} ConnectMeet</p>

            <div className="flex items-center gap-1">
              Simple meetings. Better conversations.
              <ArrowRight size={12} />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
