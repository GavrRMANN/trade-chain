package domain

import "time"

type NotificationKind string

const (
	NotificationIncomingOffer NotificationKind = "incoming_offer"
	NotificationOutgoingOffer NotificationKind = "outgoing_pending"
	NotificationInProgress    NotificationKind = "in_progress"
	NotificationFinished      NotificationKind = "finished"
)

type NotificationRead struct {
	ChainID string           `json:"chain_id"`
	Kind    NotificationKind `json:"kind"`
	ReadAt  time.Time        `json:"read_at"`
}
