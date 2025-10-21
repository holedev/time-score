import { type RealtimeChannel } from "@supabase/supabase-js";
import { getSingletonSupbaseClient } from "@/configs/supabase/realtime";
import {
  _REALTIME_ACTION_ADD_CURRENT_TEAM,
  _REALTIME_ACTION_PAUSE_CURRENT_TEAM,
  _REALTIME_ACTION_REMOVE_CURRENT_TEAM,
  _REALTIME_ACTION_START_CURRENT_TEAM,
  _REALTIME_ACTION_STOP_CURRENT_TEAM,
  _REALTIME_ACTION_TOGGLE_SCORE_EDIT,
  _REALTIME_PRESENT_EVENT_KEY
} from "@/constants/realtime";

type AddTeamCurrPayload = {
  teamId: number;
};

type RemoveTeamCurrPayload = {
  teamId: number;
  status: "PENDING" | "DONE";
};

type TimerActionPayload = {
  teamId: number;
  action: "start" | "pause" | "stop";
  timeLeft?: number;
};

type ScoreEditTogglePayload = {
  eventId: number;
  canEditScore: boolean;
  toggledBy: string; // reviewer ID who toggled
};

type SendAddTeamCurr = {
  channel: RealtimeChannel;
  payload: AddTeamCurrPayload;
};

type SendRemoveTeamCurr = {
  channel: RealtimeChannel;
  payload: RemoveTeamCurrPayload;
};

type SendTimerAction = {
  channel: RealtimeChannel;
  payload: TimerActionPayload;
};

type SendScoreEditToggle = {
  channel: RealtimeChannel;
  payload: ScoreEditTogglePayload;
};

const createPresentEventChannel = ({ eventId }: { eventId: number }) => {
  const supabase = getSingletonSupbaseClient();
  return supabase.channel(`${_REALTIME_PRESENT_EVENT_KEY}-${eventId}`);
};

const createReviewerEventChannel = ({ eventId }: { eventId: number }) => {
  const supabase = getSingletonSupbaseClient();
  return supabase.channel(`reviewer-event-${eventId}`);
};

const sendAddTeamCurr = async ({ channel, payload }: SendAddTeamCurr) => {
  await channel.send({
    type: "broadcast",
    event: _REALTIME_ACTION_ADD_CURRENT_TEAM,
    payload
  });
};

type ReceiveAddTeamCurr = {
  channel: RealtimeChannel;
  cb: ({ payload }: { payload: AddTeamCurrPayload }) => void;
};

type ReceiveRemoveTeamCurr = {
  channel: RealtimeChannel;
  cb: ({ payload }: { payload: RemoveTeamCurrPayload }) => void;
};

type ReceiveTimerAction = {
  channel: RealtimeChannel;
  cb: ({ payload }: { payload: TimerActionPayload }) => void;
};

type ReceiveScoreEditToggle = {
  channel: RealtimeChannel;
  cb: ({ payload }: { payload: ScoreEditTogglePayload }) => void;
};

const receiveAddTeamCurr = ({ channel, cb }: ReceiveAddTeamCurr) => {
  channel.on("broadcast", { event: _REALTIME_ACTION_ADD_CURRENT_TEAM }, ({ payload }) => {
    cb({ payload });
  });
};

const sendRemoveTeamCurr = async ({ channel, payload }: SendRemoveTeamCurr) => {
  await channel.send({
    type: "broadcast",
    event: _REALTIME_ACTION_REMOVE_CURRENT_TEAM,
    payload
  });
};

const receiveRemoveTeamCurr = ({ channel, cb }: ReceiveRemoveTeamCurr) => {
  channel.on("broadcast", { event: _REALTIME_ACTION_REMOVE_CURRENT_TEAM }, ({ payload }) => {
    cb({ payload });
  });
};

const sendTimerAction = async ({ channel, payload }: SendTimerAction) => {
  let eventType: string;

  if (payload.action === "start") {
    eventType = _REALTIME_ACTION_START_CURRENT_TEAM;
  } else if (payload.action === "pause") {
    eventType = _REALTIME_ACTION_PAUSE_CURRENT_TEAM;
  } else {
    eventType = _REALTIME_ACTION_STOP_CURRENT_TEAM;
  }

  await channel.send({
    type: "broadcast",
    event: eventType,
    payload
  });
};

const receiveTimerAction = ({ channel, cb }: ReceiveTimerAction) => {
  channel.on("broadcast", { event: _REALTIME_ACTION_START_CURRENT_TEAM }, ({ payload }) => {
    cb({ payload: { ...payload, action: "start" } });
  });

  channel.on("broadcast", { event: _REALTIME_ACTION_PAUSE_CURRENT_TEAM }, ({ payload }) => {
    cb({ payload: { ...payload, action: "pause" } });
  });

  channel.on("broadcast", { event: _REALTIME_ACTION_STOP_CURRENT_TEAM }, ({ payload }) => {
    cb({ payload: { ...payload, action: "stop" } });
  });
};

const sendScoreEditToggle = async ({ channel, payload }: SendScoreEditToggle) => {
  await channel.send({
    type: "broadcast",
    event: _REALTIME_ACTION_TOGGLE_SCORE_EDIT,
    payload
  });
};

const receiveScoreEditToggle = ({ channel, cb }: ReceiveScoreEditToggle) => {
  channel.on("broadcast", { event: _REALTIME_ACTION_TOGGLE_SCORE_EDIT }, ({ payload }) => {
    cb({ payload });
  });
};

export {
  createPresentEventChannel,
  sendAddTeamCurr,
  receiveAddTeamCurr,
  sendRemoveTeamCurr,
  receiveRemoveTeamCurr,
  sendTimerAction,
  receiveTimerAction,
  sendScoreEditToggle,
  receiveScoreEditToggle,
  createReviewerEventChannel
};
