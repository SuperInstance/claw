//! Trigger System
//! Defines events that can trigger the claw, and futures for awaiting conditions.

use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use tokio::time::{Duration, Interval};

/// An event that triggers the claw to think or act.
#[derive(Debug, Clone)]
pub enum TriggerEvent {
    /// A periodic timer fired.
    Timer,
    /// A cell in the spreadsheet changed.
    CellChange(String), // Cell ID
    /// Received a direct message.
    Message(String),
    /// Custom trigger with data.
    Custom(String),
}

/// A future that awaits a specific trigger condition.
pub enum TriggerFuture {
    /// Periodic ticking trigger.
    Periodic(Interval),
    /// Stub for unsupported triggers.
    Pending,
}

impl Future for TriggerFuture {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        match &mut *self {
            TriggerFuture::Periodic(interval) => interval.poll_tick(cx).map(|_| ()),
            TriggerFuture::Pending => Poll::Pending,
        }
    }
}

// Note: `create_trigger` function is commented out because `claw_core::Trigger` 
// is not yet implemented in this minimal phase.
// 
// pub fn create_trigger(trigger: &claw_core::Trigger) -> TriggerFuture {
//     match trigger {
//         claw_core::Trigger::Periodic { interval } => {
//             let duration = Duration::from_millis(*interval);
//             let interval = tokio::time::interval(duration);
//             TriggerFuture::Periodic(interval)
//         }
//         _ => TriggerFuture::Pending,
//     }
// }
