//! Trigger System
//! Converts the Seed Trigger configuration into a Future that resolves when the condition is met.

use claw_core::Trigger;
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use tokio::time::{Duration, Interval};

/// A future that awaits a specific trigger condition.
pub enum TriggerFuture {
    /// Periodic ticking trigger
    Periodic(Interval),
    /// Stub for unsupported triggers (Event, Cron)
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

/// Creates a TriggerFuture from a Trigger configuration.
pub fn create_trigger(trigger: &Trigger) -> TriggerFuture {
    match trigger {
        Trigger::Periodic { interval } => {
            let duration = Duration::from_millis(*interval);
            let interval = tokio::time::interval(duration);
            TriggerFuture::Periodic(interval)
        }
        // Event and Cron triggers are currently unsupported in this minimal runtime
        // They are stubbed to return Poll::Pending
        Trigger::Event { .. } | Trigger::Cron { .. } => TriggerFuture::Pending,
    }
}
