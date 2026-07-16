import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import MeetingModal from '../components/MeetingModal';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  RefreshCw,
  Loader2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Grid,
  List
} from 'lucide-react';

const CalendarView = () => {
  const { authFetch, user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const prevMeetingsRef = useRef([]);
const [loading, setLoading] = useState(true);
const [initialized, setInitialized] = useState(false);
const [syncing, setSyncing] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedMeeting, setSelectedMeeting] = useState(null);
const [toast, setToast] = useState(null);

  // Notify staff of newly assigned meetings (skip first load)
  useEffect(() => {
    if (!initialized) {
      // First data load, just mark initialized
      if (!loading) setInitialized(true);
      return;
    }
    if (user?.role === 'staff') {
      const newMeetings = meetings.filter(m =>
        (m.hostId?._id || m.hostId?.id || m.hostId) === user.id &&
        !prevMeetingsRef.current.some(p => p.id === m.id)
      );
      if (newMeetings.length > 0) {
        newMeetings.forEach(meet => {
          const start = new Date(meet.startTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
          const end = new Date(meet.endTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
          showToast(`New meeting assigned: ${meet.title} (${start} - ${end})`, 'success');
        });
      }
    }
    prevMeetingsRef.current = meetings;
  }, [meetings, initialized, loading]);

  

  // New States for Real-Time Monthly Calendar Grid & Time Slots
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // Defaults to today
  const [lastSync, setLastSync] = useState(new Date());
  const [hoveredCellIndex, setHoveredCellIndex] = useState(null);
  const [hoveredMeetingId, setHoveredMeetingId] = useState(null);

  const hoursRange = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // 8 AM to 8 PM

  useEffect(() => {
    fetchMeetings();

    // Polling interval for real-time background sync
    const interval = setInterval(() => {
      fetchMeetingsSilent();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/meetings');
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings);
        setLastSync(new Date());
      }
    } catch (e) {
      console.error('Error fetching meetings', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingsSilent = async () => {
    try {
      const res = await authFetch('/meetings');
      if (res.ok) {
        const data = await res.json();
        // If the user is staff, filter meetings to only those assigned to them
        const filteredMeetings = user?.role === 'staff' ? data.meetings.filter(m => (m.hostId?._id || m.hostId?.id || m.hostId) === user.id) : data.meetings;
        setMeetings(filteredMeetings);
        setLastSync(new Date());
      }
    } catch (e) {
      console.error('Background sync failed', e);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveMeeting = async (meetingData) => {
    try {
      const url = meetingData.id ? `/meetings/${meetingData.id}` : '/meetings';
      const method = meetingData.id ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(meetingData)
      });

      if (res.ok) {
        showToast(meetingData.id ? 'Meeting details updated' : 'Meeting scheduled successfully');
        setIsModalOpen(false);
        fetchMeetingsSilent();
        setViewMode('list');
      } else {
        const err = await res.json();
        showToast(err.message || 'Error scheduling meeting', 'error');
      }
    } catch (e) {
      showToast('Connection error', 'error');
    }
  };

  const handleDeleteMeeting = async (id, title) => {
    if (!window.confirm(`Cancel/Delete meeting: "${title}"?`)) return;

    try {
      const res = await authFetch(`/meetings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Meeting cancelled successfully');
        fetchMeetingsSilent();
      } else {
        showToast('Failed to cancel meeting', 'error');
      }
    } catch (e) {
      showToast('Connection error', 'error');
    }
  };

  const handleGoogleSync = async () => {
    try {
      setSyncing(true);
      const res = await authFetch('/meetings/sync', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        showToast(data.message);
        fetchMeetingsSilent();
      } else {
        showToast(data.message || 'Failed to sync calendar', 'error');
      }
    } catch (e) {
      showToast('Sync server connection error', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Calendar Grid Day Calculations
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding overlap
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevTotalDays - i;
      days.push({
        dayNum,
        date: new Date(year, month - 1, dayNum),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNum: i,
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month padding overlap to make a 6-week grid
    const totalCells = 42; 
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        dayNum: i,
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getMeetingsForDate = (date) => {
    const targetDateStr = date.toDateString();
    return meetings.filter(m => {
      const meetDate = new Date(m.startTime);
      return meetDate.toDateString() === targetDateStr;
    });
  };

  const getMeetingsForHour = (hour) => {
    if (!selectedDate) return [];
    const targetDateStr = selectedDate.toDateString();
    return meetings.filter(m => {
      const start = new Date(m.startTime);
      return start.toDateString() === targetDateStr && start.getHours() === hour;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  const handleBookDayQuick = (date) => {
    // Set start time to 09:00 AM on that day
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);

    // Set end time to 10:00 AM on that day
    const end = new Date(date);
    end.setHours(10, 0, 0, 0);

    setSelectedMeeting({
      startTime: start.toISOString(),
      endTime: end.toISOString()
    });
    setIsModalOpen(true);
  };

  const handleSlotClick = (hour) => {
    if (!selectedDate) return;
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(hour + 1, 0, 0, 0);

    setSelectedMeeting({
      startTime: start.toISOString(),
      endTime: end.toISOString()
    });
    setIsModalOpen(true);
  };

  const handleMeetingClick = (e, meeting) => {
    e.stopPropagation(); // Prevent trigger day selection
    setSelectedDate(new Date(meeting.startTime));
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatCapsuleTime = (startStr) => {
    const start = new Date(startStr);
    return start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={styles.container}>
      {/* Pulse & Hover Animation Styles */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        .live-dot-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
        .empty-slot-btn:hover {
          border-color: var(--color-primary-light) !important;
          color: var(--color-primary) !important;
          background-color: var(--color-primary-light) !important;
          opacity: 0.9;
        }
        .slot-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
          border-color: #cbd5e1 !important;
        }
      `}</style>

      <Header title="Calendar & Meetings" />

      {/* Control row */}
      <div style={styles.actionRow}>
        <div style={styles.legendAndStatus}>
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.dot, backgroundColor: 'var(--color-primary)' }} />
              <span>Assigned Meetings</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.dot, backgroundColor: 'var(--color-success)', border: 'none' }} />
              <span>Synced to Google</span>
            </div>
          </div>

          <div style={styles.liveIndicator}>
            <span className="live-dot-pulse" style={styles.liveDot} />
            <span>Live Sync ({formatTime(lastSync)})</span>
          </div>
        </div>

        <div style={styles.buttons}>
          {/* View Toggle */}
          <div style={styles.toggleGroup}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{
                ...styles.toggleBtn,
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Grid size={15} />
              <span>Grid</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{
                ...styles.toggleBtn,
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <List size={15} />
              <span>List</span>
            </button>
          </div>

          <button 
            onClick={handleGoogleSync} 
            className="btn btn-secondary"
            disabled={syncing}
            style={styles.syncBtn}
          >
            {syncing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>Sync Google Calendar</span>
          </button>
          <button onClick={() => { setSelectedMeeting(null); setIsModalOpen(true); }} className="btn btn-primary">
            <Plus size={16} />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Main meetings panel */}
      <div style={styles.panel} className="glass-panel">
        {loading ? (
          <div style={styles.loader}>Retrieving calendar...</div>
        ) : viewMode === 'grid' ? (
          /* CALENDAR MONTH GRID VIEW + HOURLY SLOTS SPLIT LAYOUT */
          <div style={styles.calendarLayout}>
            <div style={styles.calendarMain}>
              <div style={styles.calendarHeader}>
                <h3 style={styles.monthTitle}>
                  {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </h3>
                <div style={styles.navButtons}>
                  <button onClick={handlePrevMonth} style={styles.navBtn} title="Previous Month">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={handleToday} style={styles.todayBtn}>
                    Today
                  </button>
                  <button onClick={handleNextMonth} style={styles.navBtn} title="Next Month">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div style={styles.gridWeekdays}>
                {weekdays.map(d => (
                  <div key={d} style={styles.weekdayHeader}>{d}</div>
                ))}
              </div>

              <div style={styles.gridDays}>
                {getCalendarDays().map((cell, index) => {
                  const dayMeetings = getMeetingsForDate(cell.date);
                  const maxVisible = 2;
                  const visibleMeetings = dayMeetings.slice(0, maxVisible);
                  const extraCount = dayMeetings.length - maxVisible;
                  const isToday = cell.date.toDateString() === new Date().toDateString();
                  const isHovered = hoveredCellIndex === index;
                  const isSelected = selectedDate && cell.date.toDateString() === selectedDate.toDateString();

                  return (
                    <div 
                      key={index}
                      onClick={() => handleDayClick(cell.date)}
                      onMouseEnter={() => setHoveredCellIndex(index)}
                      onMouseLeave={() => setHoveredCellIndex(null)}
                      style={{
                        ...styles.dayCell,
                        backgroundColor: cell.isCurrentMonth ? 'white' : '#f8fafc',
                        ...(isHovered ? styles.dayCellHover : {}),
                        ...(isSelected ? styles.dayCellSelected : {})
                      }}
                    >
                      <div style={styles.dayNumberContainer}>
                        <span style={{
                          ...styles.dayNumber,
                          ...(isToday ? styles.todayNumber : {}),
                          ...(!cell.isCurrentMonth ? styles.mutedDayNumber : {})
                        }}>
                          {cell.dayNum}
                        </span>
                        {dayMeetings.length > 0 && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: 'var(--text-secondary)',
                            backgroundColor: '#f1f5f9',
                            padding: '1px 5px',
                            borderRadius: '8px'
                          }}>
                            {dayMeetings.length}
                          </span>
                        )}
                      </div>

                      <div style={styles.meetingCapsuleContainer}>
                        {visibleMeetings.map(meeting => {
                          const isMeetingHovered = hoveredMeetingId === meeting.id;
                          return (
                            <div
                              key={meeting.id}
                              onClick={(e) => handleMeetingClick(e, meeting)}
                              onMouseEnter={() => setHoveredMeetingId(meeting.id)}
                              onMouseLeave={() => setHoveredMeetingId(null)}
                              style={{
                                ...styles.meetingCapsule,
                                backgroundColor: meeting.googleEventId ? 'rgba(16, 185, 129, 0.08)' : 'rgba(79, 70, 229, 0.08)',
                                borderLeft: meeting.googleEventId ? '3px solid var(--color-success)' : '3px solid var(--color-primary)',
                                color: meeting.googleEventId ? 'var(--color-success)' : 'var(--color-primary)',
                                position: 'relative',
                                ...(isMeetingHovered ? styles.meetingCapsuleHover : {})
                              }}
                              title={`${meeting.title}\nTime: ${new Date(meeting.startTime).toLocaleTimeString()} - ${new Date(meeting.endTime).toLocaleTimeString()}\nLead: ${meeting.lead ? meeting.lead.name : 'General'}`}
                            >
                              <span style={styles.capsuleTime}>{formatCapsuleTime(meeting.startTime)}</span>
                              <span style={styles.capsuleTitle}>{meeting.title}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id, meeting.title); }}
                                style={styles.capsuleDeleteBtn}
                                title="Delete Meeting"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })}
                        {extraCount > 0 && (
                          <div style={styles.moreLabel}>
                            + {extraCount} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DAY SCHEDULE HOURLY TIME SLOTS SIDE PANEL */}
            <div style={styles.daySchedulePanel}>
              <div style={styles.scheduleHeader}>
                <h3 style={styles.scheduleTitle}>
                  Schedule: {selectedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
                <button 
                  onClick={() => handleBookDayQuick(selectedDate)}
                  className="btn btn-primary"
                  style={styles.scheduleQuickBtn}
                >
                  <Plus size={14} />
                  <span>Book Day</span>
                </button>
              </div>

              <div style={styles.slotsContainer}>
                {hoursRange.map(hour => {
                  const hourMeetings = getMeetingsForHour(hour);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                  const timeLabel = `${displayHour}:00 ${ampm}`;

                  return (
                    <div key={hour} style={styles.hourRow}>
                      <div style={styles.hourLabel}>{timeLabel}</div>
                      <div style={styles.hourContent}>
                        {hourMeetings.length > 0 ? (
                          hourMeetings.map(meeting => (
                            <div 
                              key={meeting.id} 
                              onClick={(e) => handleMeetingClick(e, meeting)}
                              className="slot-card"
                              style={{
                                ...styles.slotCard,
                                borderLeft: meeting.googleEventId ? '4px solid var(--color-success)' : '4px solid var(--color-primary)',
                                backgroundColor: meeting.googleEventId ? 'rgba(16, 185, 129, 0.04)' : 'rgba(79, 70, 229, 0.04)',
                              }}
                            >
                              <div style={styles.slotCardHeader}>
                                <h4 style={styles.slotCardTitle}>{meeting.title}</h4>
                                <div style={styles.slotCardActions}>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id, meeting.title); }}
                                    style={styles.slotDeleteBtn}
                                    title="Delete Booking"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              
                              <div style={styles.slotCardMeta}>
                                <span>⏰ {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {meeting.lead && (
                                  <span>👤 {meeting.lead.name}</span>
                                )}
                                {meeting.host && (
                                  <span>💼 Host: {meeting.host.username}</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <button 
                            onClick={() => handleSlotClick(hour)}
                            className="empty-slot-btn"
                            style={styles.emptySlotBtn}
                          >
                            <Plus size={14} style={{ marginRight: '6px' }} />
                            <span>Available Slot</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : meetings.length === 0 ? (
          /* TRADITIONAL LIST VIEW - EMPTY STATE */
          <div style={styles.emptyState}>
            <CalendarCheck size={48} color="var(--text-light)" />
            <h3 style={{ marginTop: '16px', color: 'var(--text-primary)' }}>No Scheduled Meetings</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              Your calendar is completely clear. Click Schedule to lock in conversations.
            </p>
          </div>
        ) : (
          /* TRADITIONAL LIST VIEW */
          <div style={styles.meetingsList}>
            {meetings.map((meeting) => (
              <div key={meeting.id} style={styles.meetingCard} className="glass-panel">
                <div style={styles.meetingLeft}>
                  {/* Calendar Widget Graphic */}
                  <div style={styles.calIcon}>
                    <div style={styles.calIconTop}>
                      {new Date(meeting.startTime).toLocaleDateString([], { month: 'short' }).toUpperCase()}
                    </div>
                    <div style={styles.calIconBody}>
                      {new Date(meeting.startTime).toLocaleDateString([], { day: '2-digit' })}
                    </div>
                  </div>

                  <div style={styles.meetingDetails}>
                    <div style={styles.titleRow}>
                      <h4 style={styles.meetingTitle}>{meeting.title}</h4>
                      {meeting.googleEventId ? (
                        <span style={styles.syncBadge} title={`Google Calendar Event ID: ${meeting.googleEventId}`}>
                          <Check size={10} />
                          <span>Google Synced</span>
                        </span>
                      ) : (
                        <span style={styles.unsyncedBadge}>Local Only</span>
                      )}
                      {meeting.host && (
                        <span style={{
                          ...styles.unsyncedBadge,
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)'
                        }}>
                          Host: {meeting.host.username}
                        </span>
                      )}
                    </div>
                    <div style={styles.timeText}>
                      {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {meeting.lead && (
                      <div style={styles.leadLink}>
                        Lead: <strong style={{ color: 'var(--text-primary)' }}>{meeting.lead.name}</strong> {meeting.lead.company ? `(${meeting.lead.company})` : ''}
                      </div>
                    )}
                    {meeting.description && (
                      <p style={styles.descText}>{meeting.description}</p>
                    )}
                  </div>
                </div>

                <div style={styles.meetingRight}>
                  <button 
                    onClick={() => { setSelectedMeeting(meeting); setIsModalOpen(true); }}
                    className="btn btn-secondary"
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteMeeting(meeting.id, meeting.title)}
                    style={styles.deleteIcon}
                    title="Cancel Meeting"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating notification Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'
        }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMeeting}
        meeting={selectedMeeting}
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  legendAndStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  legend: {
    display: 'flex',
    gap: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: '600',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  toggleGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: 'var(--border-radius-md)',
    padding: '4px',
    border: '1px solid #e2e8f0',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  syncBtn: {
    color: 'var(--color-primary)',
    borderColor: 'var(--color-primary-light)',
    backgroundColor: 'var(--color-primary-light)',
  },
  panel: {
    backgroundColor: 'white',
    padding: '24px',
    minHeight: '400px',
  },
  
  // Calendar Layout Split Styles
  calendarLayout: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    width: '100%',
  },
  calendarMain: {
    flex: '2 1 600px',
    minWidth: '300px',
  },
  daySchedulePanel: {
    flex: '1 1 350px',
    minWidth: '300px',
    backgroundColor: '#f8fafc',
    borderRadius: 'var(--border-radius-lg)',
    padding: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '800px',
    overflowY: 'auto',
  },
  scheduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  scheduleTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
  },
  scheduleQuickBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  slotsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 1,
  },
  hourRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  hourLabel: {
    width: '70px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textAlign: 'right',
    paddingTop: '8px',
  },
  hourContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  slotCard: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  slotCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  slotCardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  slotCardActions: {
    display: 'flex',
    gap: '6px',
  },
  slotDeleteBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--text-light)',
    padding: '2px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  slotCardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 12px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '6px',
  },
  emptySlotBtn: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    backgroundColor: 'white',
    color: 'var(--text-light)',
    fontSize: '12px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    outline: 'none',
  },
  
  // Calendar Header and Month Grid Styles
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  monthTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s',
  },
  todayBtn: {
    padding: '6px 14px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    transition: 'all 0.2s',
  },
  gridWeekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '8px',
    textAlign: 'center',
  },
  weekdayHeader: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    paddingBottom: '8px',
    borderBottom: '2px solid #f1f5f9',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  gridDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  dayCell: {
    minHeight: '120px',
    border: '1px solid #f1f5f9',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
  },
  dayCellHover: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.05)',
  },
  dayCellSelected: {
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 0 2px var(--color-primary-light)',
    backgroundColor: '#faf5ff',
  },
  dayNumberContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  dayNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  todayNumber: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
  },
  mutedDayNumber: {
    color: 'var(--text-light)',
  },
  meetingCapsuleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexGrow: 1,
    overflowY: 'hidden',
  },
  meetingCapsule: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'hidden',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  meetingCapsuleHover: {
    transform: 'scale(1.02)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  capsuleTime: {
    fontSize: '9px',
    opacity: 0.85,
    textTransform: 'uppercase',
  },
  capsuleTitle: {
    fontSize: '11px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  moreLabel: {
    fontSize: '11px',
    color: 'var(--color-primary)',
    fontWeight: '600',
    paddingLeft: '4px',
    marginTop: '2px',
  },
  loader: {
    padding: '80px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  emptyState: {
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  meetingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  meetingCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s',
  },
  meetingLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
  },
  calIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  calIconTop: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    fontSize: '10px',
    fontWeight: '700',
    textAlign: 'center',
    padding: '2px 0',
  },
  calIconBody: {
    backgroundColor: '#f8fafc',
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  meetingTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  syncBadge: {
    backgroundColor: 'var(--color-success-light)',
    color: 'var(--color-success)',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },
  unsyncedBadge: {
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    color: 'var(--text-secondary)',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: '600',
  },
  timeText: {
    fontSize: '13px',
    color: 'var(--color-primary)',
    fontWeight: '600',
  },
  leadLink: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  descText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    borderLeft: '2px solid #cbd5e1',
    paddingLeft: '8px',
  },
  meetingRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  editBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  deleteIcon: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--text-light)',
    padding: '6px',
    borderRadius: '50%',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'var(--color-error-light)',
      color: 'var(--color-error)',
    }
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    color: 'white',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1100,
    fontSize: '14px',
    fontWeight: '600',
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  }
};

export default CalendarView;
