/**
 * Spreadsheet Moment - Real-Time Collaborative Spreadsheet
 * Round 9: Web-Based Collaborative Editing
 *
 * React-based collaborative spreadsheet component:
 * - Real-time updates via WebSocket
 * - Presence indicators
 * - Cursor tracking
 * - Comments and discussions
 * - @mentions and notifications
 * - PWA support
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCRDT } from '../hooks/useCRDT';
import { usePresence } from '../hooks/usePresence';
import { CollaborativeCell } from './CollaborativeCell';
import { PresenceIndicator } from './PresenceIndicator';
import { CommentPanel } from './CommentPanel';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { row: number; column: number };
}

interface CellComment {
  id: string;
  cellId: string;
  author: string;
  content: string;
  timestamp: Date;
  mentions: string[];
  resolved: boolean;
}

interface SpreadsheetProps {
  spreadsheetId: string;
  userId: string;
  userName: string;
  rows?: number;
  columns?: number;
  enableComments?: boolean;
  enablePresence?: boolean;
}

/**
 * Main Collaborative Spreadsheet Component
 */
export const CollaborativeSpreadsheet: React.FC<SpreadsheetProps> = ({
  spreadsheetId,
  userId,
  userName,
  rows = 100,
  columns = 26,
  enableComments = true,
  enablePresence = true
}) => {
  // State
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [comments, setComments] = useState<Map<string, CellComment[]>>(new Map());
  const [showComments, setShowComments] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  // Custom hooks
  const { socket, isConnected, send, lastMessage } = useWebSocket(
    `wss://api.spreadsheetmoment.com/ws/spreadsheet/${spreadsheetId}`
  );

  const { document, updateCell, getCell, applyRemoteOperation } = useCRDT(spreadsheetId, userId);

  const { users, currentUser, updatePresence } = usePresence(
    spreadsheetId,
    userId,
    userName,
    socket
  );

  // Refs
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Effects
  useEffect(() => {
    if (isConnected && socket) {
      // Subscribe to spreadsheet updates
      send(JSON.stringify({
        type: 'subscribe',
        spreadsheetId,
        userId
      }));

      // Announce presence
      updatePresence();
    }
  }, [isConnected, socket]);

  useEffect(() => {
    // Handle incoming messages
    if (lastMessage) {
      const message = JSON.parse(lastMessage.data);

      switch (message.type) {
        case 'operation':
          applyRemoteOperation(message.operation);
          break;

        case 'presence':
          // Presence updates handled by hook
          break;

        case 'comment':
          handleNewComment(message.comment);
          break;

        case 'mention':
          handleMention(message.mention);
          break;
      }
    }
  }, [lastMessage]);

  // Handlers
  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    updatePresence({ row, col });
  }, [updatePresence]);

  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setEditingCell({ row, col });
    setSelectedCell({ row, col });

    // Focus input
    setTimeout(() => {
      const cellId = `cell-${row}-${col}`;
      const input = cellRefs.current.get(cellId);
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }, []);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    // Send operation via WebSocket
    send(JSON.stringify({
      type: 'operation',
      spreadsheetId,
      operation: {
        type: 'update',
        row,
        column: col,
        value,
        userId,
        timestamp: Date.now()
      }
    }));

    // Update local CRDT
    updateCell(row, col, value);

    // Check for mentions
    checkForMentions(value);
  }, [send, updateCell, userId]);

  const handleCellBlur = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    // Keyboard navigation
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleCellDoubleClick(row, Math.min(col + 1, columns - 1));
        break;

      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          handleCellClick(row, Math.max(col - 1, 0));
        } else {
          handleCellClick(row, Math.min(col + 1, columns - 1));
        }
        break;

      case 'Escape':
        setEditingCell(null);
        break;

      case 'ArrowUp':
        e.preventDefault();
        handleCellClick(Math.max(row - 1, 0), col);
        break;

      case 'ArrowDown':
        e.preventDefault();
        handleCellClick(Math.min(row + 1, rows - 1), col);
        break;

      case 'ArrowLeft':
        e.preventDefault();
        handleCellClick(row, Math.max(col - 1, 0));
        break;

      case 'ArrowRight':
        e.preventDefault();
        handleCellClick(row, Math.min(col + 1, columns - 1));
        break;
    }
  }, [handleCellClick, handleCellDoubleClick, rows, columns]);

  const handleAddComment = useCallback((cellId: string, content: string) => {
    const comment: CellComment = {
      id: `comment-${Date.now()}`,
      cellId,
      author: userName,
      content,
      timestamp: new Date(),
      mentions: extractMentions(content),
      resolved: false
    };

    // Send comment via WebSocket
    send(JSON.stringify({
      type: 'comment',
      spreadsheetId,
      comment
    }));

    // Update local state
    setComments(prev => {
      const newComments = new Map(prev);
      const cellComments = newComments.get(cellId) || [];
      newComments.set(cellId, [...cellComments, comment]);
      return newComments;
    });
  }, [send, userName, spreadsheetId]);

  const handleResolveComment = useCallback((commentId: string) => {
    setComments(prev => {
      const newComments = new Map(prev);

      for (const [cellId, comments] of newComments) {
        const updated = comments.map(c =>
          c.id === commentId ? { ...c, resolved: true } : c
        );
        newComments.set(cellId, updated);
      }

      return newComments;
    });
  }, []);

  const checkForMentions = useCallback((text: string) => {
    const mentions = extractMentions(text);

    for (const mention of mentions) {
      // Send mention notification
      send(JSON.stringify({
        type: 'mention',
        spreadsheetId,
        mention: {
          from: userId,
          to: mention,
          text,
          timestamp: Date.now()
        }
      }));
    }
  }, [send, userId, spreadsheetId]);

  const handleNewComment = useCallback((comment: CellComment) => {
    setComments(prev => {
      const newComments = new Map(prev);
      const cellComments = newComments.get(comment.cellId) || [];
      newComments.set(comment.cellId, [...cellComments, comment]);
      return newComments;
    });

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${comment.author} commented`, {
        body: comment.content,
        tag: comment.id
      });
    }
  }, []);

  const handleMention = useCallback((mention: any) => {
    if (mention.to === userId) {
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('You were mentioned', {
          body: mention.text,
          tag: `mention-${mention.timestamp}`
        });
      }
    }
  }, [userId]);

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  };

  // Render helpers
  const getColumnName = (index: number): string => {
    let name = '';
    let i = index;

    do {
      name = String.fromCharCode(65 + (i % 26)) + name;
      i = Math.floor(i / 26) - 1;
    } while (i >= 0);

    return name;
  };

  const getCellUsers = (row: number, col: number): User[] => {
    if (!enablePresence) return [];

    return users.filter(user =>
      user.cursor &&
      user.cursor.row === row &&
      user.cursor.column === col
    );
  };

  // Render
  return (
    <div className="collaborative-spreadsheet">
      {/* Header */}
      <div className="spreadsheet-header">
        <h1>Spreadsheet</h1>
        <div className="header-controls">
          {enableComments && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="icon-button"
              title="Comments"
            >
              💬
            </button>
          )}
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>
      </div>

      {/* Presence indicators */}
      {enablePresence && users.length > 0 && (
        <PresenceIndicator users={users} currentUser={currentUser} />
      )}

      {/* Main grid */}
      <div className="spreadsheet-container">
        <div className="spreadsheet-grid" ref={gridRef}>
          {/* Header row */}
          <div className="grid-row header-row">
            <div className="grid-cell corner-cell" />
            {Array.from({ length: columns }, (_, i) => (
              <div key={`header-${i}`} className="grid-cell header-cell">
                {getColumnName(i)}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid-row">
              {/* Row header */}
              <div className="grid-cell row-header">
                {rowIndex + 1}
              </div>

              {/* Cells */}
              {Array.from({ length: columns }, (_, colIndex) => {
                const cellId = `${rowIndex}-${colIndex}`;
                const cell = getCell(rowIndex, colIndex);
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                const cellUsers = getCellUsers(rowIndex, colIndex);
                const cellComments = comments.get(cellId) || [];
                const hasComments = cellComments.length > 0 && !cellComments.every(c => c.resolved);

                return (
                  <CollaborativeCell
                    key={cellId}
                    id={cellId}
                    row={rowIndex}
                    column={colIndex}
                    value={cell?.value || ''}
                    formula={cell?.formula}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    users={cellUsers}
                    hasComments={hasComments}
                    inputRef={ref => {
                      if (ref) cellRefs.current.set(cellId, ref);
                    }}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                    onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                    onBlur={handleCellBlur}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Comments panel */}
      {enableComments && showComments && selectedCell && (
        <CommentPanel
          cellId={`${selectedCell.row}-${selectedCell.col}`}
          comments={comments.get(`${selectedCell.row}-${selectedCell.col}`) || []}
          onAddComment={handleAddComment}
          onResolveComment={handleResolveComment}
          onClose={() => setShowComments(false)}
          users={users}
        />
      )}
    </div>
  );
};

export default CollaborativeSpreadsheet;
