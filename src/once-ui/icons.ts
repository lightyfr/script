import { IconType } from "react-icons";
import { MdOutlineSocialDistance } from "react-icons/md";
import { FaChartArea } from "react-icons/fa6";
import { FaUserGraduate } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { RiUserSettingsLine } from "react-icons/ri";
import { FaSignOutAlt } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { MdOutlineDangerous } from "react-icons/md";

import {
  HiChevronUp,
  HiChevronDown,
  HiChevronRight,
  HiChevronLeft,
  HiOutlineArrowPath,
  HiCheck,
  HiOutlineSun,
  HiOutlineMoon,
  HiMiniQuestionMarkCircle,
  HiMiniMinus,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiMiniPlus,
  HiMiniUser,
  HiMiniXMark,
  HiEyeDropper,
  HiOutlineClipboard,
  HiOutlineMagnifyingGlass,
  HiCalendar,
  HiOutlineLink,
  HiExclamationTriangle,
  HiArrowUpRight,
  HiInformationCircle,
  HiExclamationCircle,
  HiCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";

import { RiVisaLine } from "react-icons/ri";
import { LuLayoutDashboard } from "react-icons/lu";
import { CiGrid41 } from "react-icons/ci";
import { FaList } from "react-icons/fa6";
import { FaDiscord, FaGithub, FaGoogle } from "react-icons/fa6";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { HiOutlineMailOpen } from "react-icons/hi";
import { SlEnergy } from "react-icons/sl";
import { LuChevronsLeftRight } from "react-icons/lu";
import { arrow } from "@floating-ui/react-dom";
import { ImStatsDots } from "react-icons/im";
import { FaRegClock } from "react-icons/fa";
import { SiCampaignmonitor } from "react-icons/si";
import { LuSquareActivity } from "react-icons/lu";
import { VscChecklist } from "react-icons/vsc";
import { FaMailBulk } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { BiXCircle } from "react-icons/bi";
import { GoZap } from "react-icons/go";
import { FaGifts } from "react-icons/fa";
import { FaShieldAlt } from "react-icons/fa";
import { IoLink } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { FaBell } from "react-icons/fa6";
import { LiaReplySolid } from "react-icons/lia";

export const iconLibrary: Record<string, IconType> = {
  chevronUp: HiChevronUp,
  chevronDown: HiChevronDown,
  chevronRight: HiChevronRight,
  chevronLeft: HiChevronLeft,
  chevronsLeftRight: LuChevronsLeftRight,
  refresh: HiOutlineArrowPath,
  check: HiCheck,
  light: HiOutlineSun,
  dark: HiOutlineMoon,
  helpCircle: HiMiniQuestionMarkCircle,
  infoCircle: HiInformationCircle,
  warningTriangle: HiExclamationTriangle,
  errorCircle: HiExclamationCircle,
  checkCircle: HiCheckCircle,
  eyeDropper: HiEyeDropper,
  clipboard: HiOutlineClipboard,
  person: HiMiniUser,
  close: HiMiniXMark,
  openLink: HiOutlineLink,
  discord: FaDiscord,
  google: FaGoogle,
  github: FaGithub,
  arrowUpRight: HiArrowUpRight,
  minus: HiMiniMinus,
  plus: HiMiniPlus,
  calendar: HiCalendar,
  eye: HiOutlineEye,
  eyeOff: HiOutlineEyeSlash,
  search: HiOutlineMagnifyingGlass,
  visa: RiVisaLine,
  security: HiOutlineShieldCheck,
  sparkle: HiOutlineSparkles,
  computer: HiOutlineComputerDesktop,
  socialDistance: MdOutlineSocialDistance,
  chartLow: FaChartArea,
  userGraduate: FaUserGraduate,
  chalkboardTeacher: FaChalkboardTeacher,
  arrowDown: MdKeyboardDoubleArrowDown,
  arrowUp: FaArrowUp,
  dashboard: LuLayoutDashboard,
  stats: ImStatsDots,
  mail: HiOutlineMailOpen,
  energy: SlEnergy,
  user: RiUserSettingsLine,
  signOut: FaSignOutAlt,
  warning: IoWarning,
  danger: MdOutlineDangerous,
  clock: FaRegClock,
  grid: CiGrid41,
  list: FaList,
  campaign: SiCampaignmonitor,
  activity: LuSquareActivity,
  sparkles: HiOutlineSparkles,
  checklist: VscChecklist,
  mailBulk: FaMailBulk,
  send: IoSend,
  xCircle: BiXCircle,
  zap: GoZap,
  gift: FaGifts,
  shield: FaShieldAlt,
  link: IoLink,
  x: MdOutlineCancel,
  bell: FaBell,
  email_reply: LiaReplySolid,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;
