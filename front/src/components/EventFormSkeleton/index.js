import React from 'react';
import { Skeleton } from '@material-ui/lab';
import { Grid, } from '@material-ui/core';

export default class EventFormSkeleton extends React.Component {
    render() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Skeleton height="4rem"/>
                </Grid>
                <Grid item xs={4}>
                    <Skeleton height="4rem"/>
                </Grid>
                <Grid item xs={4}>
                    <Skeleton height="4rem"/>
                </Grid>
                <Grid item xs={4}>
                    <Skeleton height="4rem"/>
                </Grid>
                <Grid item xs={8}>
                    <Skeleton height="4rem"/>
                </Grid>
                <Grid item xs={12}>
                    <Skeleton height="4rem"/>
                </Grid>
            </Grid>
        );
    }
}
