'use client';
import { RepoCard } from '@/entities/repositories';
import { useRepositoriesByOwnerQuery } from '@/entities/repositories/gql/queries/repositoriesByOwner.graphql';
import { Input } from '@/shared/components/ui/Input';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useDebounceValue } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

export const ReposExplorer = () => {
  const [login, setLogin] = useState('');

  // we use debounce to avoid making requests after each input change
  const debouncedLogin = useDebounceValue(login);

  const {
    data,
    loading: isLoading,
    fetchMore,
  } = useRepositoriesByOwnerQuery({
    variables: {
      login: debouncedLogin,
      first: 10,
      after: null,
    },
    notifyOnNetworkStatusChange: true,
    skip: !debouncedLogin,
  });

  const repos = data?.repositoryOwner?.repositories.nodes;
  const repositoryOwner = data?.repositoryOwner;
  const endCursor = data?.repositoryOwner?.repositories.pageInfo.endCursor;
  const hasNextPage = data?.repositoryOwner?.repositories.pageInfo.hasNextPage;
  const totalCount = data?.repositoryOwner?.repositories.totalCount;
  const nothingFound = repositoryOwner === null || totalCount === 0;

  const nothingFoundMessage = nothingFound ? (
    <p className="text-center mt-5">
      <b>Ничего не найдено</b>
    </p>
  ) : null;

  const allReposAreShownMesage = !!repos?.length ? (
    <p className="text-center mt-5">
      <b>Показаны все найденные репозитории</b>
    </p>
  ) : null;

  const fetchMoreRepos = () => {
    if (!hasNextPage || !endCursor) return; // No more data

    fetchMore({
      variables: {
        login: login,
        first: 10,
        after: endCursor,
      },
      // Append the new results to the previous one
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult?.repositoryOwner) return previousResult;

        const previousRepos = previousResult.repositoryOwner?.repositories;
        const newRepos = fetchMoreResult.repositoryOwner.repositories;

        // merge results
        return {
          repositoryOwner: {
            ...fetchMoreResult.repositoryOwner,

            repositories: {
              ...newRepos,

              nodes: [
                ...(previousRepos?.nodes || []),
                ...(newRepos.nodes || []),
              ],

              pageInfo: newRepos.pageInfo,
            },
          },
        };
      },
    });
  };

  return (
    // added height equal to body inner height
    // to make infinite scroll height maximum available
    <div
      className={cn([
        'flex flex-col gap-8 w-full max-w-prose',
        {
          ['h-[calc(100vh-theme(spacing.12)*2)]']: totalCount && totalCount > 0,
        },
      ])}
    >
      <Input
        name="login"
        label="Логин GitHub"
        placeholder="Введите логин для поиска репозиториев"
        value={login}
        onChange={e => setLogin(e.target.value)}
      />
      <div className={cn(['flex-1 min-h-0', {['[&>div]:h-full']: totalCount && totalCount > 0}])}>
        <InfiniteScroll
          dataLength={repos?.length || 0}
          next={fetchMoreRepos}
          hasMore={hasNextPage || false}
          loader={false}
          height={nothingFound || !repos ? 20 : '100%'}
          endMessage={allReposAreShownMesage}
        >
          {!!repos?.length && (
            <div className="flex flex-col gap-3">
              {repos?.map(repo =>
                repo ? <RepoCard key={repo.id} repo={repo} /> : null
              )}
            </div>
          )}
        </InfiniteScroll>
        {isLoading && <Spinner className="mx-auto" />}
        {nothingFoundMessage}
      </div>
    </div>
  );
};
