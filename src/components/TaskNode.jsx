import React, { useState, useEffect, useRef } from 'react';
import { useTaskStore, defaultTaskStyle } from '../store/taskStore';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { zhCN } from 'date-fns/locale';
import { format } from 'date-fns';
import DatePickerPortal from './DatePickerPortal';
import CollapseButton from './CollapseButton';

// 极简SVG图标，全部单色 currentColor，与主工具栏一致
const LockIcon = ({ locked }) => locked ? (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="8" rx="3" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="8" rx="3" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </svg>
);
const AddIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 1 7 7l-1 1a5 5 0 0 1-7-7" />
    <path d="M14 11a5 5 0 0 0-7-7l-1 1a5 5 0 0 0 7 7" />
  </svg>
);
const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const NODE_WIDTH = 180, NODE_HEIGHT = 72;

const CalendarIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

const CARD_PADDING_X = 18;
const CARD_TEXT_WIDTH = NODE_WIDTH - CARD_PADDING_X * 2;

// 渲染多种流程图形状
function renderShape(shape, props) {
  switch (shape) {
    case 'roundRect':
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={18} {...props} />;
    case 'rect':
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={0} {...props} />;
    case 'circle':
      return <ellipse cx={NODE_WIDTH/2} cy={NODE_HEIGHT/2} rx={NODE_HEIGHT/2} ry={NODE_HEIGHT/2} {...props} />;
    case 'ellipse':
      return <ellipse cx={NODE_WIDTH/2} cy={NODE_HEIGHT/2} rx={NODE_WIDTH/2} ry={NODE_HEIGHT/2} {...props} />;
    case 'diamond':
      return <polygon points="90,0 180,36 90,72 0,36" {...props} />;
    case 'parallelogram':
      return <polygon points="36,0 180,0 144,72 0,72" {...props} />;
    case 'hexagon':
      return <polygon points="45,0 135,0 180,36 135,72 45,72 0,36" {...props} />;
    case 'pentagon':
      return <polygon points="90,0 180,36 146,72 34,72 0,36" {...props} />;
    case 'trapezoid':
      return <polygon points="36,0 144,0 180,72 0,72" {...props} />;
    case 'document':
      return <path d="M8,8 H172 Q180,8 180,24 V56 Q180,72 164,72 H16 Q8,72 8,56 V24 Q8,8 24,8 Z" {...props} />;
    case 'cloud':
      return <path d="M50,60 Q30,60 30,40 Q10,40 20,25 Q20,10 40,15 Q50,0 70,10 Q90,0 100,15 Q120,10 120,25 Q130,40 110,40 Q110,60 90,60 Q80,70 70,60 Q60,70 50,60 Z" transform="scale(1.5 1.1) translate(10,5)" {...props} />;
    case 'flag':
      return <path d="M20,10 L160,10 L140,40 L160,70 L20,70 Z" {...props} />;
    case 'arrowRight':
      return <polygon points="20,36 120,36 120,16 180,36 120,56 120,36 20,36" {...props} />;
    case 'arrowLeft':
      return <polygon points="160,36 60,36 60,16 0,36 60,56 60,36 160,36" {...props} />;
    case 'doubleArrow':
      return <polygon points="0,36 40,16 40,30 140,30 140,16 180,36 140,56 140,42 40,42 40,56 0,36" {...props} />;
    case 'star':
      return <polygon points="90,10 105,60 180,60 120,90 140,150 90,110 40,150 60,90 0,60 75,60" {...props} />;
    case 'heart':
      return <path d="M90,72 Q0,24 45,0 Q90,24 135,0 Q180,24 90,72 Z" {...props} />;
    case 'quote':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>""</text></g>;
    case 'brace':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>{}</text></g>;
    case 'bracket':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>[ ]</text></g>;
    case 'parenthesis':
      return <g><text x="40" y="50" fontSize="48" fontFamily="serif" {...props}>( )</text></g>;
    default:
      return <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={18} {...props} />;
  }
}

const TaskNode = ({ task, onClick, onStartLink, onDelete, selected, onDrag, multiSelected, isFirst, onEditingChange }) => {
  const updateTask = useTaskStore((state) => state.updateTask);
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addLink = useTaskStore((state) => state.addLink);
  const moveTaskSilently = useTaskStore((state) => state.moveTaskSilently);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [locked, setLocked] = useState(task.lock || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(task.date ? new Date(task.date) : null);
  const timeTextRef = useRef();
  const [anchorRect, setAnchorRect] = useState(null);
  const [dragStartPos, setDragStartPos] = useState(null);
  const allTasks = useTaskStore(state => state.tasks);
  const toggleCollapse = useTaskStore(state => state.toggleCollapse);
  const hasChildren = allTasks.some(t => t.parentId === task.id);
  const [hover, setHover] = useState(false);

  // 读取样式属性，提供默认值
  const {
    shape = defaultTaskStyle.shape,
    fillColor = isFirst ? "#222" : defaultTaskStyle.fillColor,
    borderColor = defaultTaskStyle.borderColor,
    borderWidth = defaultTaskStyle.borderWidth,
    borderStyle = defaultTaskStyle.borderStyle,
  } = task;

  useEffect(() => {
    setLocked(task.lock || false);
    setDate(task.date ? new Date(task.date) : null);
  }, [task.lock, task.date]);

  useEffect(() => {
    if (typeof onEditingChange === 'function') {
      onEditingChange(editing);
    }
  }, [editing, onEditingChange]);

  // 拖拽逻辑
  const handleMouseDown = (e) => {
    if (locked) return; // 锁定时禁止拖动
    // 多选且当前节点被选中时，不处理拖动，交给MainCanvas
    if (multiSelected) return;
    // 拖动开始时保存快照
    useTaskStore.getState()._saveSnapshot();
    setDragging(true);
    setOffset({
      x: e.clientX - task.position.x,
      y: e.clientY - task.position.y,
    });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    let x = e.clientX - offset.x;
    let y = e.clientY - offset.y;
    if (dragStartPos && (Math.abs(e.clientX - dragStartPos.x) > 2 || Math.abs(e.clientY - dragStartPos.y) > 2)) {
      if (onDrag) {
        onDrag(task.id, x, y, NODE_WIDTH, NODE_HEIGHT);
      }
    }
    // 磁性吸附
    const SNAP_THRESHOLD = 6;
    const tasks = useTaskStore.getState().tasks;
    let snapX = x, snapY = y;
    let minDeltaX = SNAP_THRESHOLD, minDeltaY = SNAP_THRESHOLD;
    tasks.forEach(t => {
      if (t.id === task.id) return;
      // 计算对方的中心/边缘
      const tCenterX = t.position.x + NODE_WIDTH / 2;
      const tCenterY = t.position.y + NODE_HEIGHT / 2;
      const tLeft = t.position.x, tRight = t.position.x + NODE_WIDTH;
      const tTop = t.position.y, tBottom = t.position.y + NODE_HEIGHT;
      // 本节点中心/边缘
      const thisCenterX = x + NODE_WIDTH / 2;
      const thisCenterY = y + NODE_HEIGHT / 2;
      const thisLeft = x, thisRight = x + NODE_WIDTH;
      const thisTop = y, thisBottom = y + NODE_HEIGHT;
      // 中心对齐
      if (Math.abs(thisCenterX - tCenterX) < minDeltaX) {
        snapX = tCenterX - NODE_WIDTH / 2;
        minDeltaX = Math.abs(thisCenterX - tCenterX);
      }
      if (Math.abs(thisCenterY - tCenterY) < minDeltaY) {
        snapY = tCenterY - NODE_HEIGHT / 2;
        minDeltaY = Math.abs(thisCenterY - tCenterY);
      }
      // 左右对齐
      if (Math.abs(thisLeft - tLeft) < minDeltaX) {
        snapX = tLeft;
        minDeltaX = Math.abs(thisLeft - tLeft);
      }
      if (Math.abs(thisRight - tRight) < minDeltaX) {
        snapX = tRight - NODE_WIDTH;
        minDeltaX = Math.abs(thisRight - tRight);
      }
      // 上下对齐
      if (Math.abs(thisTop - tTop) < minDeltaY) {
        snapY = tTop;
        minDeltaY = Math.abs(thisTop - tTop);
      }
      if (Math.abs(thisBottom - tBottom) < minDeltaY) {
        snapY = tBottom - NODE_HEIGHT;
        minDeltaY = Math.abs(thisBottom - tBottom);
      }
    });
    // 拖动中只用静默方法，不触发快照
    moveTaskSilently(task.id, { x: snapX, y: snapY });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDragStartPos(null);
    // 拖动结束时用updateTask，但不保存快照
    updateTask(task.id, { position: useTaskStore.getState().tasks.find(t => t.id === task.id).position }, false);
    if (onDrag) onDrag(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // 编辑逻辑
  const handleDoubleClick = (e) => {
    setEditing(true);
    e.stopPropagation();
  };

  const handleInputBlur = () => {
    setEditing(false);
    updateTask(task.id, { title });
  };

  // 添加任务
  const handleAddTask = (e) => {
    e.stopPropagation();
    const newTask = {
      id: Date.now(),
      title: '新任务',
      position: { x: task.position.x + 300, y: task.position.y }, // 右侧 300px
      links: [],
      parentId: task.id,
      level: (task.level || 0) + 1,
    };
    addTask(newTask);
    // 右中点 (fromAnchor) 和左中点 (toAnchor)
    const fromAnchor = { x: NODE_WIDTH, y: NODE_HEIGHT / 2 };
    const toAnchor = { x: 0, y: NODE_HEIGHT / 2 };
    addLink(task.id, newTask.id, fromAnchor, toAnchor);
  };

  // 添加子任务
  const handleAddChildTask = (e) => {
    e.stopPropagation();
    const newTask = {
      id: Date.now(),
      title: '子任务',
      position: { x: task.position.x, y: task.position.y + 180 }, // 下方，间距180
      links: [],
      parentId: task.id, // 作为当前节点的子任务
      level: (task.level || 0) + 1, // 层级+1
      date: task.date ? task.date : undefined, // 继承父任务的date
    };
    addTask(newTask);
    // 可选：自动连线
    addLink(task.id, newTask.id, { x: NODE_WIDTH / 2, y: NODE_HEIGHT }, { x: NODE_WIDTH / 2, y: 0 });
  };

  // 添加同级任务
  const handleAddSiblingTask = (e) => {
    e.stopPropagation();
    const newTask = {
      id: Date.now(),
      title: '同级任务',
      position: { x: task.position.x + 300, y: task.position.y }, // 右侧
      links: [],
      parentId: task.parentId, // 保持与当前节点一致
      level: task.level,       // 保持与当前节点一致
    };
    addTask(newTask);
    // 不再手动 addLink，链式连线自动渲染
  };

  // 删除任务
  const handleDeleteTask = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(task.id);
    else deleteTask(task.id);
  };

  // 连线
  const handleStartLink = (e) => {
    e.stopPropagation();
    if (onStartLink) onStartLink(task);
  };

  const handleLockToggle = (e) => {
    e.stopPropagation();
    updateTask(task.id, { lock: !locked });
    setLocked(!locked);
  };

  // 日期变更
  const handleDateChange = (newDate) => {
    setDate(newDate);
    setShowDatePicker(false);
    updateTask(task.id, { date: newDate, autoDate: false });
    // 新增：如果有下游卡片且它们autoDate为true或未定义，则级联推算
    const allTasks = useTaskStore.getState().tasks;
    const outLinks = task.links || [];
    for (const link of outLinks) {
      const toTask = allTasks.find(t => t.id === link.toId);
      if (toTask && (toTask.autoDate === true || toTask.autoDate === undefined)) {
        // 触发MainCanvas的cascadeUpdateDates
        if (window.cascadeUpdateDates) window.cascadeUpdateDates(task.id);
        break;
      }
    }
  };

  const handleTimeClick = (e) => {
    e.stopPropagation();
    if (task.autoDate) return;
    if (timeTextRef.current) {
      const rect = timeTextRef.current.getBoundingClientRect();
      setAnchorRect(rect);
      setShowDatePicker(true);
    }
  };

  // 动态计算第一个子任务的实际方位，决定折叠/展开按钮和连线锚点
  let collapseBtnAnchor = { x: NODE_WIDTH / 2 - 10, y: NODE_HEIGHT + 4 }; // 默认下方
  let dynamicFromAnchor = { x: NODE_WIDTH / 2, y: NODE_HEIGHT }; // 默认下边中点
  let dynamicToAnchor = { x: NODE_WIDTH / 2, y: 0 }; // 默认上边中点
  if (hasChildren) {
    const children = allTasks.filter(t => t.parentId === task.id);
    if (children.length > 0) {
      const firstChild = children[0];
      // 计算子任务中心与当前节点中心的相对位置
      const dx = (firstChild.position.x + NODE_WIDTH / 2) - (task.position.x + NODE_WIDTH / 2);
      const dy = (firstChild.position.y + NODE_HEIGHT / 2) - (task.position.y + NODE_HEIGHT / 2);
      if (Math.abs(dx) > Math.abs(dy)) {
        // 水平为主
        if (dx > 0) {
          collapseBtnAnchor = { x: NODE_WIDTH, y: NODE_HEIGHT / 2 - 10 }; // 右
          dynamicFromAnchor = { x: NODE_WIDTH, y: NODE_HEIGHT / 2 };
          dynamicToAnchor = { x: 0, y: NODE_HEIGHT / 2 };
        } else {
          collapseBtnAnchor = { x: -20, y: NODE_HEIGHT / 2 - 10 }; // 左
          dynamicFromAnchor = { x: 0, y: NODE_HEIGHT / 2 };
          dynamicToAnchor = { x: NODE_WIDTH, y: NODE_HEIGHT / 2 };
        }
      } else {
        // 垂直为主
        if (dy > 0) {
          collapseBtnAnchor = { x: NODE_WIDTH / 2 - 10, y: NODE_HEIGHT + 4 }; // 下
          dynamicFromAnchor = { x: NODE_WIDTH / 2, y: NODE_HEIGHT };
          dynamicToAnchor = { x: NODE_WIDTH / 2, y: 0 };
        } else {
          collapseBtnAnchor = { x: NODE_WIDTH / 2 - 10, y: -20 }; // 上
          dynamicFromAnchor = { x: NODE_WIDTH / 2, y: 0 };
          dynamicToAnchor = { x: NODE_WIDTH / 2, y: NODE_HEIGHT };
        }
      }
    }
  }

  // 主体形状渲染
  function getShapeStrokeDasharray(style) {
    if (style === 'dashed') return '8,4';
    if (style === 'none') return '0';
    return undefined;
  }

  return (
    <g
      transform={`translate(${task.position.x}, ${task.position.y})`}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      style={{ cursor: editing ? 'default' : 'move' }}
      filter={editing ? 'drop-shadow(0 4px 16px rgba(0,0,0,0.10))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))'}
      data-task-id={task.id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* 主体形状：支持多种流程图形状 */}
      {borderStyle !== 'none' && renderShape(shape, {fill: fillColor, stroke: borderColor, strokeWidth: borderWidth, style: {transition: 'all 0.2s cubic-bezier(.4,0,.2,1)'}, strokeDasharray: getShapeStrokeDasharray(borderStyle) })}
      {borderStyle === 'none' && renderShape(shape, {fill: fillColor, stroke: 'none', strokeWidth: 0 })}
      {/* 工具栏：仅选中时显示 */}
      {selected && !editing && (
        <g transform="translate(90, -24)">
          <rect x={-60} y={-16} width={120} height={32} rx={12} fill="#fff" stroke="#e0e0e5" strokeWidth={1} filter="drop-shadow(0 2px 8px rgba(0,0,0,0.08))" />
          {/* 锁定按钮 */}
          <g onClick={handleLockToggle} style={{ cursor: 'pointer' }} transform="translate(-28, 0)">
            <rect x={-12} y={-12} width={24} height={24} rx={8} fill="transparent" stroke="none" />
            <foreignObject x={-10} y={-10} width={20} height={20}>
              <div style={{width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',color:locked?'#222':'#bbb'}}>
                <LockIcon locked={locked} />
              </div>
            </foreignObject>
          </g>
          {/* 连线按钮 */}
          <g onMouseDown={handleStartLink} style={{ cursor: 'crosshair' }} transform="translate(0, 0)">
            <rect x={-10} y={-10} width={20} height={20} rx={7} fill="transparent" stroke="none" />
            <foreignObject x={-10} y={-10} width={20} height={20}>
              <div style={{width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',color:'#222'}}>
                <LinkIcon />
              </div>
            </foreignObject>
          </g>
          {/* 删除任务按钮 */}
          <g onClick={handleDeleteTask} style={{ cursor: 'pointer' }} transform="translate(28, 0)">
            <rect x={-10} y={-10} width={20} height={20} rx={7} fill="transparent" stroke="none" />
            <foreignObject x={-10} y={-10} width={20} height={20}>
              <div style={{width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',color:'#222'}}>
                <DeleteIcon />
              </div>
            </foreignObject>
          </g>
        </g>
      )}
      {/* 右侧添加同级任务按钮 */}
      {/* 下方添加子任务按钮 */}
      {editing ? (
        <foreignObject x={0} y={0} width={NODE_WIDTH} height={NODE_HEIGHT}>
          <input
            style={{
              width: '100%',
              height: '100%',
              textAlign: task.textAlign || 'center',
              fontSize: task.fontSize || 16,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontWeight: task.fontWeight || 500,
              color: isFirst ? '#fff' : (task.color || '#222'),
              fontFamily: task.fontFamily || '思源黑体',
              borderRadius: 18,
              cursor: 'text',
              fontStyle: task.fontStyle || 'normal',
              textDecoration: task.textDecoration || 'none',
            }}
            value={title}
            autoFocus
            onChange={e => setTitle(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') handleInputBlur();
            }}
          />
        </foreignObject>
      ) : (
        <>
          {/* 居中标题 */}
          <text
            x={task.textAlign === 'left' ? CARD_PADDING_X : task.textAlign === 'right' ? NODE_WIDTH - CARD_PADDING_X : NODE_WIDTH / 2}
            y={(() => {
              // 自动换行算法（提前算一次，供y和内容共用）
              const ctx = document.createElement('canvas').getContext('2d');
              ctx.font = `${task.fontWeight || 600} ${task.fontSize || 14}px ${task.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif'}`;
              const words = (task.title || '').split('');
              let lines = [], line = '';
              for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i];
                const w = ctx.measureText(testLine).width;
                if (w > CARD_TEXT_WIDTH && line) {
                  lines.push(line);
                  line = words[i];
                } else {
                  line = testLine;
                }
              }
              if (line) lines.push(line);
              // 居中：首行y=32，第二行y=32+18=50
              return lines.length > 1 ? 20 : 32;
            })()}
            fontSize={task.fontSize || 16}
            fontWeight={task.fontWeight || 600}
            fontStyle={task.fontStyle || 'normal'}
            fill={isFirst ? '#fff' : (task.color || '#222')}
            fontFamily={task.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif'}
            style={{
              userSelect: 'none',
              cursor: 'pointer',
              textAnchor: task.textAlign === 'left' ? 'start' : task.textAlign === 'right' ? 'end' : 'middle',
              textDecoration: task.textDecoration || 'none',
            }}
            onDoubleClick={handleDoubleClick}
          >
            {(() => {
              const ctx = document.createElement('canvas').getContext('2d');
              ctx.font = `${task.fontWeight || 600} ${task.fontSize || 14}px ${task.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif'}`;
              const words = (task.title || '').split('');
              let lines = [], line = '';
              for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i];
                const w = ctx.measureText(testLine).width;
                if (w > CARD_TEXT_WIDTH && line) {
                  lines.push(line);
                  line = words[i];
                } else {
                  line = testLine;
                }
              }
              if (line) lines.push(line);
              return lines.map((l, idx) => (
                <tspan key={idx} x={task.textAlign === 'left' ? CARD_PADDING_X : task.textAlign === 'right' ? NODE_WIDTH - CARD_PADDING_X : NODE_WIDTH / 2} dy={idx === 0 ? 0 : 18}>{l}</tspan>
              ));
            })()}
          </text>
          {/* 居中时间模块，保持胶囊自适应宽度 */}
          <foreignObject x={0} y={40} width={NODE_WIDTH} height={28}>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: '#555',
                  background: 'rgba(243, 243, 246, 0.8)',
                  borderRadius: 6,
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginTop: 0,
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                }}
                onClick={handleTimeClick}
                ref={timeTextRef}
              >
                <span style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
                  <CalendarIcon size={12} />
                </span>
                {date ? format(date, 'yyyy年M月d日') : '设置日期'}
              </div>
            </div>
          </foreignObject>
        </>
      )}
      {showDatePicker && anchorRect && (
        <DatePickerPortal anchorRect={anchorRect}>
          <ReactDatePicker
            selected={date}
            onChange={handleDateChange}
            onClickOutside={() => setShowDatePicker(false)}
            locale={zhCN}
            dateFormat="yyyy年M月d日"
            inline
          />
        </DatePickerPortal>
      )}
      {/* 悬停桥梁，覆盖卡片下方到按钮gap的区域，避免鼠标移到按钮时按钮消失，但不覆盖按钮本身 */}
      {hasChildren && (
        <rect
          x={NODE_WIDTH / 2 - 24}
          y={NODE_HEIGHT}
          width={48}
          height={8} // 只覆盖gap
          fill="transparent"
          pointerEvents="all"
        />
      )}
      {/* 折叠/展开按钮：有子任务且悬停时显示，或者有子任务且已折叠时始终显示，直接内联SVG */}
      {(hasChildren && (hover || task.collapsed)) && (
        <g
          transform={`translate(${collapseBtnAnchor.x}, ${collapseBtnAnchor.y})`}
          style={{ cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); toggleCollapse(task.id); }}
        >
          <circle cx="10" cy="10" r="9" fill="#fff" stroke="#e0e0e5" strokeWidth="1" />
          {/* 横线，始终显示 */}
          <line x1="6" y1="10" x2="14" y2="10" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
          {/* 竖线，仅在折叠时显示（即+号） */}
          {task.collapsed && (
            <line x1="10" y1="6" x2="10" y2="14" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
          )}
        </g>
      )}
      {(hover || selected || multiSelected) && (
        renderShape(shape, {
          // 对于rect/ellipse/circle等，扩大尺寸
          ...(shape === 'rect' || shape === 'roundRect' ? {
            x: -4,
            y: -4,
            width: NODE_WIDTH + 8,
            height: NODE_HEIGHT + 8,
            rx: shape === 'roundRect' ? 22 : 0,
          } : shape === 'ellipse' ? {
            cx: NODE_WIDTH / 2,
            cy: NODE_HEIGHT / 2,
            rx: NODE_WIDTH / 2 + 4,
            ry: NODE_HEIGHT / 2 + 4,
          } : shape === 'circle' ? {
            cx: NODE_WIDTH / 2,
            cy: NODE_HEIGHT / 2,
            rx: NODE_HEIGHT / 2 + 4,
            ry: NODE_HEIGHT / 2 + 4,
          } : {
            // 其它多边形/路径，整体放大1.08倍并中心缩放
            style: { transform: `scale(1.08) translate(${NODE_WIDTH * 0.04},${NODE_HEIGHT * 0.04})` }
          }),
          fill: 'none',
          stroke: '#1251a580',
          strokeWidth: 2,
          pointerEvents: 'none',
          style: {
            transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
            ...(shape !== 'rect' && shape !== 'roundRect' && shape !== 'ellipse' && shape !== 'circle' ? { transform: `scale(1.08) translate(${NODE_WIDTH * 0.04},${NODE_HEIGHT * 0.04})` } : {})
          }
        })
      )}
    </g>
  );
};

export default TaskNode;