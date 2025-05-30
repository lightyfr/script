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

import { FaDiscord, FaGithub, FaGoogle } from "react-icons/fa6";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { HiOutlineMailOpen } from "react-icons/hi";
import { SlEnergy } from "react-icons/sl";
import { LuChevronsLeftRight } from "react-icons/lu";
import { arrow } from "@floating-ui/react-dom";
import { ImStatsDots } from "react-icons/im";
import { FaRegClock } from "react-icons/fa";

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
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;
