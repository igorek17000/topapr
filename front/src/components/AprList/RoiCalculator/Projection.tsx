import { Divider, Stack, Typography, Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { getDays } from 'utils/getDays';
import { strToNum } from 'utils/strToNum';
import { useTable, usePagination } from 'react-table';
import { styled } from '@mui/material/styles';

interface ProjectionProps {
  apr: number;
  staked: string;
  stakedTime: string;
  compoundChecked: boolean;
  compoundTime: string;
  roi: number | undefined;
  compoundEarnings: {
    earning: number;
    balance: number;
  }[];
  setRoi: React.Dispatch<React.SetStateAction<number | undefined>>;
  setCompoundEarnings: React.Dispatch<
    React.SetStateAction<
      {
        earning: number;
        balance: number;
      }[]
    >
  >;
}

export default function Projection(props: ProjectionProps) {
  const {
    apr,
    staked,
    stakedTime,
    compoundChecked,
    compoundTime,
    roi,
    compoundEarnings,
    setRoi,
    setCompoundEarnings,
  } = props;

  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const aprDaily = apr / 365;
    const stakedDays = getDays(stakedTime);
    const stakedNum = strToNum(staked);
    const compoundDays = getDays(compoundTime) || 1;
    if (stakedNum && stakedDays) {
      setRoi((aprDaily * stakedDays * stakedNum) / 100);
      const earnings = Array.from(Array(stakedDays)).reduce(
        (prev, curr, idx) => {
          const lastEarning =
            prev.length === 0
              ? {
                  earning: 0,
                  balance: stakedNum,
                }
              : prev[prev.length - 1];

          console.log(idx, idx % compoundDays);
          const roi = (() => {
            if (!compoundChecked) return (aprDaily * stakedNum) / 100;
            if (idx % compoundDays === 0)
              return (aprDaily * lastEarning.balance) / 100;

            return lastEarning.earning;
          })();

          const currentEarning = {
            earning: roi,
            balance: roi + lastEarning.balance,
          };

          return [...prev, currentEarning];
        },
        [] as { earning: number; balance: number }[]
      );

      setCompoundEarnings(earnings);
      setTotalEarnings(
        earnings[earnings.length - 1].balance - (strToNum(staked) || 0)
      );
    }
  }, [
    apr,
    staked,
    stakedTime,
    compoundChecked,
    compoundTime,
    setCompoundEarnings,
    setRoi,
  ]);

  const data = useMemo(() => {
    const stakedNum = strToNum(staked);
    return compoundEarnings.map((earning, idx) => ({
      col1: idx + 1,
      col2: `$${earning.earning.toLocaleString()}`,
      col3: `$${(earning.balance - (stakedNum || 0)).toLocaleString()}`,
      col4: `$${earning.balance.toLocaleString()}`,
    }));
  }, [compoundEarnings, staked]);

  const columns = useMemo(
    () => [
      {
        Header: 'Day',
        accessor: 'col1',
      },
      {
        Header: 'Earnings',
        accessor: 'col2',
      },
      {
        Header: 'Total Earnings',
        accessor: 'col3',
      },
      {
        Header: 'Balance',
        accessor: 'col4',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    } as any,
    usePagination
  ) as any;

  return (
    <div>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h5" sx={{ mb: 3 }}>
        Projection
      </Typography>
      <Stack direction="row" spacing={6}>
        <Stack spacing={1}>
          <div>
            <Typography variant="caption">Days</Typography>
            <Typography variant="h4">{getDays(stakedTime)}</Typography>
          </div>
          <div>
            <Typography variant="caption">Initial balance</Typography>
            <Typography variant="h4">${staked}</Typography>
          </div>
          <div>
            <Typography variant="caption">Daily interest rate</Typography>
            <Typography variant="h4">
              {(apr / 365).toLocaleString()}%
            </Typography>
          </div>
          <div>
            <Typography variant="caption">APR</Typography>
            <Typography variant="h4">{apr.toLocaleString()}%</Typography>
          </div>
        </Stack>
        <Stack spacing={1}>
          <div>
            <Typography variant="caption">Total Earnings</Typography>
            <Typography variant="h4" color="primary">
              $
              {!compoundChecked
                ? roi?.toLocaleString()
                : totalEarnings.toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="caption">Total Investment Value</Typography>
            <Typography variant="h4" color="primary">
              $
              {!compoundChecked
                ? ((roi || 0) + (strToNum(staked) || 0)).toLocaleString()
                : (totalEarnings + (strToNum(staked) || 0)).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="caption">Percentage profit</Typography>
            <Typography variant="h4" color="primary">
              {strToNum(staked)
                ? (
                    (totalEarnings / (strToNum(staked) || 1)) *
                    100
                  ).toLocaleString()
                : 0}
              %
            </Typography>
          </div>
        </Stack>
      </Stack>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h5" sx={{ mb: 3 }}>
        Earnings breakdown
      </Typography>
      <Styles>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup: any) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: any) => (
                  <th {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row: any, i: number) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell: any) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>{' '}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>{' '}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>{' '}
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {'>>'}
          </button>{' '}
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <span>
            | Go to page:{' '}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: '100px' }}
            />
          </span>{' '}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </Styles>
    </div>
  );
}

const Styles = styled(Box)`
  padding: 0;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding-top: 0.5rem;
  }
`;
