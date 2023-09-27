import styles from './page.module.css'

export default async function Index() {
  const { data } = await getData()

  return (
    <div className={styles.page}>
      <div className='wrapper'>
        <div className='container'>
          <div id='welcome'>
            <h1>
              <span> Hello there, </span>
              Welcome to Next.js 👋
            </h1>
          </div>
          <div id='commands' className='rounded shadow'>
            <p>Here are some Call Centers in the U.S.A.:</p>
            {data?.map((callCenter: any) => {
              return (
                <details key={callCenter['cc_call_center_id']}>
                  <summary>
                    {`${callCenter['cc_name']} - ${callCenter['cc_county']} - ${callCenter['cc_city']} - ${callCenter['cc_state']}`}
                  </summary>
                  <pre>
                    <span>Manager</span>
                    {callCenter['cc_manager']}
                    <span>Market Manager</span>
                    {callCenter['cc_market_manager']}
                  </pre>
                </details>
              )
            })}
          </div>
          <p id='love'>
            Carefully crafted with
            <svg fill='currentColor' stroke='none' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
              />
            </svg>
          </p>
        </div>
      </div>
    </div>
  )
}

async function getData() {
  const res = await fetch(`http://localhost:4200/api`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}
