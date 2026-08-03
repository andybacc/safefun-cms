import React, { useState, useEffect } from 'react';
import { fetchAdminData } from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { OverviewHeader } from '../components/overview/OverviewHeader';
import { OverviewMetrics } from '../components/overview/OverviewMetrics';
import { EventsTable } from '../components/overview/EventsTable';
import { BusinessPlansInsight } from '../components/overview/BusinessPlansInsight';

export const OverviewPage = ({ setToast }) => {
  const config = useConfig();
  const auth = useAuth();

  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [rcSubscribers, setRcSubscribers] = useState([]);
  const [plansMeta, setPlansMeta] = useState({ revenuecat_active_count: null, revenuecat_verified: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, plansRes] = await Promise.all([
        fetchAdminData('/overview/events', {}, config, auth).catch((e) => ({ success: false, error: e.message })),
        fetchAdminData('/overview/plans', {}, config, auth).catch((e) => ({ success: false, error: e.message })),
      ]);

      if (eventsRes?.success || Array.isArray(eventsRes)) {
        setEvents(eventsRes.data || eventsRes.events || (Array.isArray(eventsRes) ? eventsRes : []));
      }
      if (plansRes?.db_plans || Array.isArray(plansRes) || plansRes?.data) {
        const plansArray = plansRes.db_plans || plansRes.data || (Array.isArray(plansRes) ? plansRes : []);
        setPlans(plansArray);
        setRcSubscribers(plansRes.rc_subscribers || []);
        setPlansMeta({
          db_active_count: plansArray.length,
          revenuecat_active_count: (plansRes.rc_subscribers || []).length,
          revenuecat_verified: plansRes.rc_verified ?? false,
          has_discrepancy: plansRes.has_discrepancy ?? false,
          discrepancies: plansRes.discrepancies ?? [],
        });
      }
    } catch (err) {
      setError(err.message);
      setToast({ type: 'error', message: `Caricamento panoramica non riuscito: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalParticipants = events.reduce(
    (acc, ev) => acc + (Number(ev.registrations_count) || Number(ev.nomi) || Number(ev.checkin) || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <OverviewHeader onRefresh={loadData} loading={loading} />
      <OverviewMetrics
        eventsCount={events.length}
        plansCount={plans.length}
        totalParticipants={totalParticipants}
      />
      <EventsTable events={events} loading={loading} error={error} onRefresh={loadData} />
      <BusinessPlansInsight
        plans={plans}
        rcSubscribers={rcSubscribers}
        plansMeta={plansMeta}
      />
    </div>
  );
};
