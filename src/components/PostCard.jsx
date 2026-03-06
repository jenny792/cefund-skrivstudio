import { useState } from 'react'
import { Check, Pencil, X, Copy, Linkedin, ShieldCheck, ShieldAlert, ShieldX, Loader2, Sparkles } from 'lucide-react'
import { isLinkedInType, LINKEDIN_TYPES } from '../lib/linkedinTypes'
import { isNewsletterType } from '../lib/newsletterTypes'

function ComplianceBadge({ compliance }) {
  const verdict = compliance?.verdict || 'unknown'

  if (verdict === 'pass') {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <ShieldCheck size={12} /> Godkänd
      </span>
    )
  }
  if (verdict === 'warning') {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
        <ShieldAlert size={12} /> Varning
      </span>
    )
  }
  if (verdict === 'fail') {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
        <ShieldX size={12} /> Ej godkänd
      </span>
    )
  }
  // unknown
  if (compliance?.validating) {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
        <Loader2 size={12} className="animate-spin" /> Validerar...
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <ShieldAlert size={12} /> Ej validerad
    </span>
  )
}

export default function PostCard({ post, onUpdate, onToggleSelect, isSelected, onRevalidate }) {
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState(post.fields)
  const [copied, setCopied] = useState(false)

  const isLinkedin = isLinkedInType(post.story_type)
  const isNewsletter = isNewsletterType(post.story_type)
  const isCustom = post.story_type === 'custom' || post.story_type === 'custom-linkedin' || post.story_type === 'custom-newsletter'

  const compliance = post.compliance || { verdict: 'unknown', issues: [] }
  const issues = compliance.issues || []

  function handleSave() {
    const updated = { ...post, fields }
    onUpdate(updated)
    setEditing(false)
    // Nollställ compliance och trigga revalidering
    if (onRevalidate) {
      onRevalidate({ ...updated, compliance: { verdict: 'unknown', issues: [], validating: true } })
    }
  }

  function handleCancel() {
    setFields(post.fields)
    setEditing(false)
  }

  function handleCopyText() {
    // Använd columns-ordningen så att Hook kommer först, CTA sist
    const typeInfo = LINKEDIN_TYPES.find(t => t.id === post.story_type)
    const orderedKeys = typeInfo ? typeInfo.columns : Object.keys(fields)
    const text = orderedKeys
      .map(key => fields[key])
      .filter(Boolean)
      .join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`rounded-2xl border bg-white transition-all duration-200 ${
      isSelected ? 'border-warm shadow-md' : 'border-gray-200 hover:shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(post.id)}
            className="w-4 h-4 accent-accent"
          />
          {isLinkedin && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              <Linkedin size={12} /> LinkedIn
            </span>
          )}
          {isNewsletter && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              Nyhetsbrev
            </span>
          )}
          {isCustom && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Custom
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            post.status === 'reviewed'
              ? 'bg-green-100 text-green-700'
              : post.status === 'exported'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-text-muted'
          }`}>
            {post.status === 'reviewed' ? 'Klar' : post.status === 'exported' ? 'Exporterad' : 'Utkast'}
          </span>
          <ComplianceBadge compliance={compliance} />
        </div>
        <div className="flex gap-1">
          {editing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600">
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                <X size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-muted">
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Fält — visa i columns-ordning */}
      <div className="p-4 space-y-3">
        {(() => {
          const typeInfo = LINKEDIN_TYPES.find(t => t.id === post.story_type)
          const keys = typeInfo ? typeInfo.columns.filter(k => k in fields) : Object.keys(fields)
          return keys.map(key => [key, fields[key]])
        })().map(([key, value]) => (
          <div key={key}>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide">{key}</label>
            {editing ? (
              <textarea
                value={value}
                onChange={e => setFields({ ...fields, [key]: e.target.value })}
                rows={isNewsletter ? 6 : isLinkedin ? 4 : 2}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-accent resize-none"
              />
            ) : (
              <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-line">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Compliance-issues */}
      {issues.length > 0 && !editing && (
        <div className="px-4 pb-3">
          <div className={`rounded-xl p-3 space-y-3 ${
            compliance.verdict === 'fail' ? 'bg-red-50 border border-red-100' : 'bg-orange-50 border border-orange-100'
          }`}>
            {issues.map((issue, i) => (
              <div key={i} className="text-xs space-y-1.5">
                <div>
                  <span className={`font-medium ${
                    compliance.verdict === 'fail' ? 'text-red-700' : 'text-orange-700'
                  }`}>{issue.rule}:</span>{' '}
                  <span className={compliance.verdict === 'fail' ? 'text-red-600' : 'text-orange-600'}>
                    {issue.detail}
                  </span>
                </div>
                {issue.suggestion && issue.original && issue.field && (
                  <div className="ml-2 pl-2 border-l-2 border-green-300 space-y-1">
                    <p className="text-green-700 leading-relaxed">
                      <span className="font-medium">Förslag:</span> {issue.suggestion}
                    </p>
                    <button
                      onClick={() => {
                        const fieldValue = fields[issue.field] || ''
                        const updated = fieldValue.replace(issue.original, issue.suggestion)
                        if (updated === fieldValue) return
                        const newFields = { ...fields, [issue.field]: updated }
                        setFields(newFields)
                        const updatedPost = { ...post, fields: newFields }
                        onUpdate(updatedPost)
                        if (onRevalidate) {
                          onRevalidate({ ...updatedPost, compliance: { verdict: 'unknown', issues: [], validating: true } })
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 font-medium transition-colors"
                    >
                      <Sparkles size={12} /> Applicera
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kopiera-knapp för LinkedIn/Nyhetsbrev/Custom */}
      {(isLinkedin || isNewsletter || isCustom) && !editing && (
        <div className="px-4 pb-4">
          <button
            onClick={handleCopyText}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              copied
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-navy hover:bg-navy-light text-white'
            }`}
          >
            {copied ? (
              <><Check size={16} /> Kopierat!</>
            ) : (
              <><Copy size={16} /> {isNewsletter ? 'Kopiera nyhetsbrev' : isLinkedin ? 'Kopiera för LinkedIn' : 'Kopiera text'}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
