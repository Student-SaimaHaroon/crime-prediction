import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from './mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(() => loadData());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cyber_auth') === 'true';
  });

  // Listen for storage changes (cross-tab / manual localStorage set)
  useEffect(() => {
    const check = () => setIsAuthenticated(localStorage.getItem('cyber_auth') === 'true');
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveData(next);
      return next;
    });
  }, []);

  const login = (email, password) => {
    // Demo credentials
    const validCredentials = [
      { email: 'arjun@cybercrime.gov.in', password: 'Admin@123', userId: 'USR001' },
      { email: 'admin@cybercrime.gov.in', password: 'Admin@123', userId: 'USR004' },
      { email: 'officer@cybercrime.gov.in', password: 'Admin@123', userId: 'USR001' },
    ];
    const match = validCredentials.find(c => c.email === email && c.password === password);
    if (match) {
      localStorage.setItem('cyber_auth', 'true');
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    localStorage.removeItem('cyber_auth');
    setIsAuthenticated(false);
  };

  // Complaint operations
  const addComplaint = (complaint) => {
    const newComplaint = {
      ...complaint,
      id: `CMP-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Registered',
      linkedTransactions: [],
      linkedCase: null,
      predictionStatus: 'Pending',
      predictionId: null,
      createdBy: data.currentUser.id,
      statusHistory: [{ status: 'Registered', user: data.currentUser.name, timestamp: new Date().toISOString(), notes: 'Complaint registered' }],
      activityLog: [{ action: 'Complaint Created', user: data.currentUser.name, timestamp: new Date().toISOString(), type: 'create' }],
    };
    updateData(prev => {
      const updated = { ...prev, complaints: [newComplaint, ...prev.complaints] };
      // Add notification
      const notif = {
        id: `NOTIF-${Date.now()}`,
        type: 'success',
        severity: 'medium',
        title: 'New Complaint Registered',
        message: `Complaint ${newComplaint.id} has been successfully registered.`,
        timestamp: new Date().toISOString(),
        read: false,
        linkedId: newComplaint.id,
        linkedType: 'complaint',
      };
      updated.notifications = [notif, ...prev.notifications];
      // Audit log
      const audit = {
        id: `AUDIT-${Date.now()}`,
        user: prev.currentUser.name,
        role: prev.currentUser.role,
        action: 'CREATE',
        resource: `Complaint ${newComplaint.id}`,
        timestamp: new Date().toISOString(),
        result: 'Success',
        ipAddress: '192.168.1.10',
      };
      updated.auditLogs = [audit, ...prev.auditLogs];
      return updated;
    });
    return newComplaint;
  };

  const updateComplaint = (id, updates) => {
    updateData(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteComplaint = (id) => {
    updateData(prev => ({
      ...prev,
      complaints: prev.complaints.filter(c => c.id !== id),
    }));
  };

  // Transaction operations
  const addTransaction = (transaction) => {
    const newTxn = { ...transaction, id: `TXN-${Date.now()}`, flagged: false };
    updateData(prev => ({ ...prev, transactions: [newTxn, ...prev.transactions] }));
    return newTxn;
  };

  const flagTransaction = (id) => {
    updateData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, flagged: !t.flagged, status: t.flagged ? 'Normal' : 'Flagged' } : t),
    }));
  };

  // Prediction operations
  const addPrediction = (prediction) => {
    const newPred = {
      ...prediction,
      id: `PRED-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'Active',
    };
    updateData(prev => {
      const updated = { ...prev, predictions: [newPred, ...prev.predictions] };
      // Update complaint prediction status
      updated.complaints = prev.complaints.map(c =>
        c.id === prediction.complaintId ? { ...c, predictionStatus: 'Completed', predictionId: newPred.id } : c
      );
      // Add notification if high risk
      if (newPred.riskScore >= 70) {
        const notif = {
          id: `NOTIF-${Date.now()}`,
          type: 'alert',
          severity: newPred.riskScore >= 85 ? 'critical' : 'high',
          title: `${newPred.riskCategory} Risk Prediction Detected`,
          message: `Prediction ${newPred.id} scored ${newPred.riskScore}/100 for ${newPred.predictedLocation}.`,
          timestamp: new Date().toISOString(),
          read: false,
          linkedId: newPred.id,
          linkedType: 'prediction',
        };
        updated.notifications = [notif, ...prev.notifications];
      }
      // Audit
      const audit = {
        id: `AUDIT-${Date.now()}`,
        user: prev.currentUser.name,
        role: prev.currentUser.role,
        action: 'RUN_PREDICTION',
        resource: `Prediction ${newPred.id}`,
        timestamp: new Date().toISOString(),
        result: 'Success',
        ipAddress: '192.168.1.10',
      };
      updated.auditLogs = [audit, ...prev.auditLogs];
      return updated;
    });
    return newPred;
  };

  // Case operations
  const addCase = (caseData) => {
    const newCase = {
      ...caseData,
      id: `CASE-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'Active',
      timeline: [{ id: `EVT-${Date.now()}`, type: 'Case Created', user: data.currentUser.name, timestamp: new Date().toISOString(), description: 'Case created', result: 'Success' }],
    };
    updateData(prev => {
      const updated = { ...prev, cases: [newCase, ...prev.cases] };
      // Link complaints
      updated.complaints = prev.complaints.map(c =>
        caseData.linkedComplaints?.includes(c.id) ? { ...c, linkedCase: newCase.id, status: 'Case Linked' } : c
      );
      const notif = {
        id: `NOTIF-${Date.now()}`,
        type: 'info',
        severity: 'medium',
        title: `Case ${newCase.id} Created`,
        message: `New investigation case "${newCase.title}" has been created and assigned.`,
        timestamp: new Date().toISOString(),
        read: false,
        linkedId: newCase.id,
        linkedType: 'case',
      };
      updated.notifications = [notif, ...prev.notifications];
      return updated;
    });
    return newCase;
  };

  const updateCase = (id, updates) => {
    updateData(prev => ({
      ...prev,
      cases: prev.cases.map(c => c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : c),
    }));
  };

  const addCaseEvent = (caseId, event) => {
    const newEvent = { ...event, id: `EVT-${Date.now()}`, timestamp: new Date().toISOString() };
    updateData(prev => ({
      ...prev,
      cases: prev.cases.map(c => c.id === caseId ? { ...c, timeline: [...(c.timeline || []), newEvent] } : c),
    }));
  };

  // Notification operations
  const markNotificationRead = (id) => {
    updateData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  };

  const markAllNotificationsRead = () => {
    updateData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  };

  // User management
  const addUser = (user) => {
    const newUser = { ...user, id: `USR-${Date.now()}`, status: 'Active', lastLogin: null };
    updateData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  };

  const updateUser = (id, updates) => {
    updateData(prev => ({ ...prev, users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u) }));
  };

  // Model management
  const deployModel = (modelId) => {
    updateData(prev => ({
      ...prev,
      models: prev.models.map(m => ({
        ...m,
        status: m.id === modelId ? 'Active' : (m.status === 'Active' ? 'Archived' : m.status),
        deployedDate: m.id === modelId ? new Date().toISOString().split('T')[0] : m.deployedDate,
      })),
    }));
  };

  // Report generation
  const generateReport = (config) => {
    const report = {
      id: `RPT-${Date.now()}`,
      ...config,
      generatedAt: new Date().toISOString(),
      generatedBy: data.currentUser.name,
      status: 'Generated',
    };
    updateData(prev => {
      const updated = { ...prev, reports: [report, ...prev.reports] };
      const notif = {
        id: `NOTIF-${Date.now()}`,
        type: 'success',
        severity: 'low',
        title: 'Report Generated',
        message: `Report "${report.reportType}" has been generated successfully.`,
        timestamp: new Date().toISOString(),
        read: false,
        linkedId: report.id,
        linkedType: 'report',
      };
      updated.notifications = [notif, ...prev.notifications];
      return updated;
    });
    return report;
  };

  const unreadCount = data.notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      data,
      isAuthenticated,
      login,
      logout,
      updateData,
      addComplaint,
      updateComplaint,
      deleteComplaint,
      addTransaction,
      flagTransaction,
      addPrediction,
      addCase,
      updateCase,
      addCaseEvent,
      markNotificationRead,
      markAllNotificationsRead,
      addUser,
      updateUser,
      deployModel,
      generateReport,
      unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}